from django.db.models import F
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response

from apps.orders.models import OrderItem

from .models import Annale
from .serializers import AnnaleSerializer


class AnnaleListView(ListAPIView):
    serializer_class = AnnaleSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Annale.objects.all()
    filterset_fields = ["category", "year", "is_popular", "is_new"]
    search_fields = ["title", "description"]
    ordering_fields = ["price", "year", "downloads"]


class AnnaleDetailView(RetrieveAPIView):
    serializer_class = AnnaleSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Annale.objects.all()


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def annale_preview_view(request, pk):
    try:
        annale = Annale.objects.get(pk=pk)
    except Annale.DoesNotExist:
        raise NotFound("Annale introuvable.")
    return Response({"id": str(annale.id), "title": annale.title, "preview_url": annale.preview_url})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def annale_download_view(request, pk):
    try:
        annale = Annale.objects.get(pk=pk)
    except Annale.DoesNotExist:
        raise NotFound("Annale introuvable.")

    has_paid = OrderItem.objects.filter(
        annale=annale,
        order__user=request.user,
        order__status="paid",
    ).exists()
    if not has_paid:
        return Response({"message": "Achat requis pour telecharger cette annale."}, status=403)

    Annale.objects.filter(pk=annale.pk).update(downloads=F("downloads") + 1)
    fake_signed_url = annale.preview_url or "https://example.com/signed-download"
    return Response({"url": fake_signed_url, "expires_in": 600})
