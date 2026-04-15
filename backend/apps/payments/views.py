import hashlib
import hmac
import os

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order

from .models import Payment
from .providers import ProviderError, get_payment_provider
from .serializers import PaymentInitiateSerializer, PaymentSerializer


def _apply_payment_status(payment: Payment, status_value: str, raw_payload=None) -> None:
    if status_value == "paid":
        payment.status = "paid"
        payment.order.status = "paid"
        payment.order.save(update_fields=["status"])
    elif status_value == "failed":
        payment.status = "failed"
        payment.order.status = "failed"
        payment.order.save(update_fields=["status"])

    update_fields = ["status", "updated_at"]
    if raw_payload is not None:
        payment.raw_payload = raw_payload
        update_fields.append("raw_payload")
    payment.save(update_fields=update_fields)


class PaymentInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = Order.objects.filter(id=serializer.validated_data["order_id"], user=request.user).first()
        if not order:
            return Response({"message": "Commande introuvable"}, status=404)

        if order.status == "paid":
            return Response({"message": "Cette commande a déjà été payée."}, status=400)

        provider_mode = os.getenv("PAYMENT_PROVIDER_MODE", "mock").lower().strip()
        provider_name = serializer.validated_data["provider"]

        payment = Payment.objects.create(
            order=order,
            provider=provider_name,
            phone=serializer.validated_data["phone"],
            amount=order.total,
            status="initiated",
            payment_url="",
        )

        try:
            provider = get_payment_provider(provider_name=provider_name, mode=provider_mode)
            result = provider.initiate_payment(payment)
        except ProviderError as exc:
            payment.raw_payload = {"provider_error": str(exc), "mode": provider_mode, "provider": provider_name}
            payment.save(update_fields=["raw_payload", "updated_at"])
            return Response({"message": str(exc)}, status=503)

        payment.payment_url = result.payment_url
        payment.provider_reference = result.provider_reference or ""
        if result.raw_payload:
            payment.raw_payload = result.raw_payload
            payment.save(update_fields=["payment_url", "provider_reference", "raw_payload", "updated_at"])
        else:
            payment.save(update_fields=["payment_url", "provider_reference", "updated_at"])

        return Response({
            "payment_url": payment.payment_url,
            "payment_id": str(payment.id),
            "mock_mode": provider_mode == "mock",
        })


class PaymentStatusView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)


class PaymentMockConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if os.getenv("PAYMENT_PROVIDER_MODE", "mock").lower() != "mock":
            return Response({"message": "Le mode mock est desactive."}, status=403)

        payment = Payment.objects.filter(id=pk, order__user=request.user).first()
        if not payment:
            return Response({"message": "Paiement introuvable"}, status=404)

        status_value = request.data.get("status", "paid")
        if status_value not in {"paid", "failed"}:
            return Response({"message": "Statut invalide"}, status=400)

        _apply_payment_status(payment, status_value, raw_payload={"mock": True, "status": status_value})
        return Response(PaymentSerializer(payment).data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def payment_webhook_view(request):
    signature = request.headers.get("X-Signature", "")
    secret = os.getenv("PAYMENT_WEBHOOK_SECRET", "dev-secret")
    expected = hmac.new(secret.encode(), request.body, digestmod=hashlib.sha256).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return Response({"message": "Signature webhook invalide"}, status=400)

    payment_id = request.data.get("payment_id")
    status_value = request.data.get("status")
    payment = Payment.objects.filter(id=payment_id).first()
    if not payment:
        return Response({"message": "Paiement introuvable"}, status=404)

    _apply_payment_status(payment, status_value, raw_payload=request.data)
    return Response({"message": "Webhook traite"})
