import os
from dataclasses import dataclass
import requests

from apps.payments.models import Payment


class ProviderError(Exception):
    pass


@dataclass
class PaymentInitiationResult:
    payment_url: str
    provider_reference: str = ""
    raw_payload: dict = None


class BasePaymentProvider:
    provider_name: str

    def initiate_payment(self, payment: Payment) -> PaymentInitiationResult:
        raise NotImplementedError


class MockPaymentProvider(BasePaymentProvider):
    provider_name = "mock"

    def initiate_payment(self, payment: Payment) -> PaymentInitiationResult:
        return PaymentInitiationResult(
            payment_url=f"https://mock-payments.local/checkout/{payment.id}",
            provider_reference=f"MOCK-{payment.id}",
            raw_payload={"mode": "mock", "provider": payment.provider},
        )


class PaydunyaPaymentProvider(BasePaymentProvider):
    provider_name = "paydunya"

    def initiate_payment(self, payment: Payment) -> PaymentInitiationResult:
        """
        Initiate payment with PayDunya API with comprehensive validation.
        
        Args:
            payment: Payment object with order and customer details
            
        Returns:
            PaymentInitiationResult with validated payment URL and reference
            
        Raises:
            ProviderError: If payment initiation fails or URL is invalid
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # === ENVIRONMENT CONSISTENCY CHECK ===
            master_key = os.getenv("PAYDUNYA_MASTER_KEY")
            private_key = os.getenv("PAYDUNYA_PRIVATE_KEY")
            public_key = os.getenv("PAYDUNYA_PUBLIC_KEY")
            token = os.getenv("PAYDUNYA_TOKEN")
            paydunya_mode = os.getenv("PAYDUNYA_MODE", "test")
            provider_mode = os.getenv("PAYMENT_PROVIDER_MODE", "mock")
            
            # CRITICAL: Validate environment consistency
            if paydunya_mode == "test" and provider_mode != "mock":
                logger.warning(f"ENVIRONMENT INCONSISTENCY: PAYDUNYA_MODE={paydunya_mode} but PAYMENT_PROVIDER_MODE={provider_mode}")
                logger.warning("Forcing consistency: Setting provider_mode to match paydunya_mode")
                provider_mode = "mock"  # Force consistency for test mode
            
            logger.info(f"Environment: PAYDUNYA_MODE={paydunya_mode}, PAYMENT_PROVIDER_MODE={provider_mode}")
            
            # Validate required keys
            if not all([master_key, private_key, public_key, token]):
                raise ProviderError("Missing PayDunya API keys. Check your environment variables.")
            
            # === ENDPOINT VERIFICATION ===
            if paydunya_mode == "test":
                api_url = "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create"
                expected_url_pattern = "https://paydunya.com/sandbox-checkout/invoice/"
                logger.info(f"Using PayDunya TEST mode: {api_url}")
            else:
                api_url = "https://app.paydunya.com/api/v1/checkout-invoice/create"
                expected_url_pattern = "https://paydunya.com/checkout/invoice/"
                logger.info(f"Using PayDunya LIVE mode: {api_url}")
            
            # === BUILD INVOICE DATA ===
            invoice_data = {
                "invoice": {
                    "total_amount": int(payment.amount),  # Ensure integer
                    "description": f"Commande {payment.order.id}",
                    "customer": {
                        "name": "Client",  # TODO: Get from user when available
                        "email": "client@example.com",  # TODO: Get from user when available
                        "phone": payment.phone
                    },
                    "items": {
                        "item_0": {
                            "name": f"Commande {payment.order.id}",
                            "quantity": 1,
                            "unit_price": str(int(payment.amount)),  # String as per docs
                            "total_price": str(int(payment.amount)),  # String as per docs
                            "description": "Achat d'annales"
                        }
                    }
                },
                "store": {
                    "name": "Infos Concours Sénégal",
                    "tagline": "Plateforme de préparation aux concours au Sénégal",
                    "postal_address": "Dakar, Sénégal",
                    "phone": "+221 78 333 26 97",
                    "logo_url": "",
                    "website_url": os.getenv("FRONTEND_URL", "http://localhost:8080")
                },
                "custom_data": {
                    "payment_id": str(payment.id),
                    "order_id": str(payment.order.id)
                },
                "actions": {
                    "cancel_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:8080')}/payment/cancel",
                    "return_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:8080')}/payment/success",
                    "callback_url": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/v1/payments/webhook/"
                }
            }
            
            # === API REQUEST ===
            headers = {
                "Content-Type": "application/json",
                "PAYDUNYA-MASTER-KEY": master_key,
                "PAYDUNYA-PRIVATE-KEY": private_key,
                "PAYDUNYA-PUBLIC-KEY": public_key,
                "PAYDUNYA-TOKEN": token
            }
            
            logger.info(f"Initiating PayDunya payment for order {payment.order.id}")
            logger.debug(f"Request URL: {api_url}")
            logger.debug(f"Request data: {invoice_data}")
            
            # Make API request with retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        api_url, 
                        json=invoice_data, 
                        headers=headers,
                        timeout=30
                    )
                    break
                except requests.RequestException as e:
                    if attempt == max_retries - 1:
                        raise
                    logger.warning(f"Retry {attempt + 1}/{max_retries} due to: {e}")
                    continue
            
            # === RESPONSE VALIDATION ===
            logger.info(f"PayDunya API response status: {response.status_code}")
            logger.debug(f"Response headers: {dict(response.headers)}")
            
            if response.status_code != 200:
                logger.error(f"PayDunya API error: {response.status_code} - {response.text}")
                raise ProviderError(f"PayDunya API error {response.status_code}: {response.text}")
            
            # Parse JSON response
            try:
                result = response.json()
                logger.debug(f"Response body: {result}")
            except ValueError as e:
                logger.error(f"Invalid JSON response: {e}")
                raise ProviderError(f"Invalid JSON response from PayDunya: {response.text}")
            
            # Extract payment URL and reference
            payment_url = result.get("response_text", "").strip()
            provider_reference = result.get("token", "").strip()
            
            # === PAYMENT URL VALIDATION ===
            if not payment_url:
                logger.error("No payment URL in response")
                raise ProviderError("PayDunya did not return a payment URL")
            
            # Validate URL format
            if not payment_url.startswith(expected_url_pattern):
                logger.error(f"Invalid payment URL format: {payment_url}")
                logger.error(f"Expected pattern: {expected_url_pattern}")
                raise ProviderError(f"Invalid payment URL format: {payment_url}")
            
            # === CRITICAL: LIVE URL VALIDATION ===
            logger.info(f"Validating payment URL: {payment_url}")
            try:
                validation_response = requests.get(
                    payment_url, 
                    timeout=10,
                    headers={"User-Agent": "PayDunya-Integration-Validator/1.0"}
                )
                
                logger.info(f"URL validation status: {validation_response.status_code}")
                logger.debug(f"URL validation response length: {len(validation_response.text)}")
                
                if validation_response.status_code != 200:
                    logger.error(f"Payment URL validation failed: {validation_response.status_code}")
                    logger.error(f"Response: {validation_response.text[:500]}")
                    raise ProviderError(f"Payment URL is not accessible (HTTP {validation_response.status_code})")
                
                # Check for common error patterns
                if "404" in validation_response.text or "page not found" in validation_response.text.lower():
                    logger.error("Payment URL returns 404 page")
                    raise ProviderError("Payment URL returns 404 page not found")
                
                if "invoice" not in validation_response.text.lower() and "checkout" not in validation_response.text.lower():
                    logger.warning("Payment URL may not be a valid checkout page")
                
                logger.info(" Payment URL validation successful")
                
            except requests.RequestException as e:
                logger.error(f"Payment URL validation failed: {e}")
                raise ProviderError(f"Cannot validate payment URL: {str(e)}")
            
            # === SUCCESS ===
            logger.info(f" Payment URL generated and validated: {payment_url}")
            logger.info(f"Provider reference: {provider_reference}")
            
            return PaymentInitiationResult(
                payment_url=payment_url,
                provider_reference=provider_reference
            )

        except ImportError:
            logger.error("Requests module not available")
            raise ProviderError("Module requests non installé. Installez 'requests'")
        except requests.RequestException as e:
            logger.error(f"Network error during PayDunya request: {e}")
            raise ProviderError(f"Network error during PayDunya request: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during PayDunya initiation: {e}")
            raise ProviderError(f"Erreur lors de l'initiation Paydunya: {str(e)}")


def get_payment_provider(provider_name: str, mode: str) -> BasePaymentProvider:
    provider_name = (provider_name or "").lower().strip()
    mode = (mode or "mock").lower().strip()

    if mode == "mock":
        return MockPaymentProvider()

    if provider_name == "paydunya":
        return PaydunyaPaymentProvider()

    raise ProviderError("Fournisseur de paiement non supporte. Utilisez 'paydunya' ou activez le mode mock.")
