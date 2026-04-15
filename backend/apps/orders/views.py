from django.db import transaction
from rest_framework import permissions, status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.response import Response

from apps.annales.models import Annale

from .models import Order, OrderItem
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderCreateView(CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items_data = serializer.validated_data["items"]

        # Pre-validate all annales exist before touching the DB
        annale_ids = [item["annale_id"] for item in items_data]
        annales_map = {a.id: a for a in Annale.objects.filter(pk__in=annale_ids)}
        missing = [str(aid) for aid in annale_ids if aid not in annales_map]
        if missing:
            return Response({"message": "Annale(s) introuvable(s)."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = Order.objects.create(user=request.user, status="pending", total=0)
            total = 0
            for item in items_data:
                annale = annales_map[item["annale_id"]]
                quantity = item["quantity"]
                total += annale.price * quantity
                OrderItem.objects.create(order=order, annale=annale, quantity=quantity, unit_price=annale.price)

            order.total = total
            order.save(update_fields=["total"])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class MyOrdersView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items__annale")


class OrderDetailView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items__annale")


