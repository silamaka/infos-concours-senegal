from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemWriteSerializer(serializers.Serializer):
    annale_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class OrderItemSerializer(serializers.ModelSerializer):
    annale_id = serializers.UUIDField(source="annale.id")
    title = serializers.CharField(source="annale.title")
    price = serializers.IntegerField(source="unit_price")

    class Meta:
        model = OrderItem
        fields = ["annale_id", "title", "price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "status", "total", "created_at", "items"]


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemWriteSerializer(many=True)
