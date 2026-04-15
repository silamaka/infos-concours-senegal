from dataclasses import dataclass

from apps.payments.models import Payment


class ProviderError(Exception):
    pass


@dataclass
class PaymentInitiationResult:
    payment_url: str
    provider_reference: str = ""
    raw_payload: dict | None = None


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


class WavePaymentProvider(BasePaymentProvider):
    provider_name = "wave"

    def initiate_payment(self, payment: Payment) -> PaymentInitiationResult:
        raise ProviderError("API Wave non configuree pour le moment.")


class OrangePaymentProvider(BasePaymentProvider):
    provider_name = "orange"

    def initiate_payment(self, payment: Payment) -> PaymentInitiationResult:
        raise ProviderError("API Orange Money non configuree pour le moment.")


def get_payment_provider(provider_name: str, mode: str) -> BasePaymentProvider:
    provider_name = (provider_name or "").lower().strip()
    mode = (mode or "mock").lower().strip()

    if mode == "mock":
        return MockPaymentProvider()

    if provider_name == "wave":
        return WavePaymentProvider()

    if provider_name == "orange":
        return OrangePaymentProvider()

    raise ProviderError("Fournisseur de paiement non supporte.")
