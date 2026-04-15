from rest_framework import serializers

from .models import Payment


class PaymentInitiateSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    provider = serializers.ChoiceField(choices=["wave", "orange"])
    phone = serializers.CharField(max_length=32)


class PaymentSerializer(serializers.ModelSerializer):
    payment_id = serializers.UUIDField(source="id", read_only=True)

    class Meta:
        model = Payment
        fields = ["payment_id", "status", "payment_url"]
