from django.db.models import F
from django.db import models
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView, RetrieveAPIView, ListCreateAPIView

from rest_framework.response import Response
import hashlib
import time

from apps.orders.models import OrderItem

from .models import Annale, Review
from .models_pack import Pack

from .serializers import AnnaleSerializer, PackSerializer, ReviewSerializer
from django.views.decorators.http import require_GET
from django.utils.decorators import method_decorator

# --- Vue sécurisée pour servir le PDF ---
from django.http import HttpResponse, Http404
from urllib.parse import unquote, urlparse
from django.urls import reverse
import os


def _normalize_pdf_key(raw_key: str) -> str:
    """Normalise un pdf_key potentiellement stocké en URL complète.

    Exemples supportés:
    - http://localhost:8000/media/annales/pdfs/file.pdf
    - /media/annales/file.pdf
    - pdfs/file.pdf
    - file.pdf
    """
    value = (raw_key or "").strip()
    if not value:
        return ""

    parsed = urlparse(value)
    candidate = parsed.path if parsed.scheme else value
    candidate = unquote(candidate).replace("\\", "/")

    marker = "/annales/"
    idx = candidate.rfind(marker)
    if idx >= 0:
        candidate = candidate[idx + len(marker):]

    candidate = candidate.lstrip("/")
    if candidate.startswith("media/"):
        candidate = candidate[len("media/"):]
    if candidate.startswith("annales/"):
        candidate = candidate[len("annales/"):]

    return candidate


def _resolve_pdf_path(raw_key: str):
    import os
    from django.conf import settings

    normalized = _normalize_pdf_key(raw_key)
    filename = os.path.basename(normalized)
    if not filename:
        return "", ""

    base_dir = os.path.join(settings.MEDIA_ROOT, "annales")
    candidates = [
        os.path.join(base_dir, normalized),
        os.path.join(base_dir, "pdfs", filename),
        os.path.join(base_dir, filename),
    ]

    for path in candidates:
        if os.path.isfile(path):
            return filename, path

    return filename, candidates[0]

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def annale_pdf_serve_view(request, pdf_key):
    import hashlib
    import time
    from django.conf import settings

    expires = request.GET.get("expires")
    token = request.GET.get("token")
    if not expires or not token:
        raise Http404("Lien de téléchargement invalide.")
    try:
        expires = int(expires)
    except ValueError:
        raise Http404("Paramètre d'expiration invalide.")
    if expires < int(time.time()):
        raise Http404("Lien de téléchargement expiré.")

    normalized_key, pdf_path = _resolve_pdf_path(pdf_key)
    if not normalized_key:
        raise Http404("Lien de téléchargement invalide.")

    secret = settings.SECRET_KEY
    expected_token = hashlib.sha256(f"{normalized_key}:{expires}:{secret}".encode()).hexdigest()
    if token != expected_token:
        raise Http404("Token de téléchargement invalide.")

    if not os.path.isfile(pdf_path):
        raise Http404("Fichier PDF introuvable.")

    with open(pdf_path, "rb") as f:
        response = HttpResponse(f.read(), content_type="application/pdf")
        response["Content-Disposition"] = f"attachment; filename={normalized_key}"
        return response


class AnnaleListView(ListAPIView):
    serializer_class = AnnaleSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        return Annale.objects.all().annotate(
            average_rating=models.Avg("review_set__rating"),
            reviews_count=models.Count("review_set")
        ).order_by("-created_at")
    filterset_fields = ["category", "year", "is_popular", "is_new"]
    search_fields = ["title", "description"]
    ordering_fields = ["price", "year", "downloads"]


class PackListView(ListAPIView):
    serializer_class = PackSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Pack.objects.all()
    filterset_fields = ["title"]
    search_fields = ["title", "description"]
    ordering_fields = ["price", "created_at"]


class PackDetailView(RetrieveAPIView):
    serializer_class = PackSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Pack.objects.all()


class AnnaleDetailView(RetrieveAPIView):
    serializer_class = AnnaleSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        return Annale.objects.all().annotate(
            average_rating=models.Avg("review_set__rating"),
            reviews_count=models.Count("review_set")
        )


# --- Reviews API ---
class ReviewListCreateView(ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        annale_id = self.kwargs["annale_id"]
        return Review.objects.filter(annale_id=annale_id).select_related("user").order_by("-created_at")

    def perform_create(self, serializer):
        annale_id = self.kwargs["annale_id"]
        serializer.save(user=self.request.user, annale_id=annale_id)


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
    import logging
    from django.conf import settings

    logger = logging.getLogger("apps.annales")

    try:
        annale = Annale.objects.get(pk=pk)
    except Annale.DoesNotExist:
        logger.warning(f"Tentative de téléchargement d'une annale inexistante (id={pk}) par user={request.user}")
        raise NotFound("Annale introuvable.")

    has_paid = OrderItem.objects.filter(
        annale=annale,
        order__user=request.user,
        order__status="paid",
    ).exists()
    if not has_paid:
        logger.info(f"Refus téléchargement annale id={annale.id} : user={request.user} n'a pas payé.")
        return Response({"message": "Achat requis pour telecharger cette annale."}, status=403)

    Annale.objects.filter(pk=annale.pk).update(downloads=F("downloads") + 1)

    raw_pdf_key = annale.pdf_key
    if not raw_pdf_key:
        logger.error(f"Annale id={annale.id} sans PDF associé (user={request.user})")
        return Response({"message": "Aucun PDF associé à cette annale."}, status=404)

    normalized_key, pdf_path = _resolve_pdf_path(raw_pdf_key)
    if not os.path.isfile(pdf_path):
        logger.error(f"Fichier PDF manquant : {raw_pdf_key} (user={request.user}, annale={annale.id})")
        return Response({"message": "Fichier PDF introuvable."}, status=404)

    # Générer un lien signé temporaire (token simple)
    expires = int(time.time()) + 600  # 10 minutes
    secret = settings.SECRET_KEY
    token_raw = f"{normalized_key}:{expires}:{secret}"
    token = hashlib.sha256(token_raw.encode()).hexdigest()
    pdf_relative_url = reverse("annales-pdf-serve", kwargs={"pdf_key": normalized_key})
    pdf_url = request.build_absolute_uri(f"{pdf_relative_url}?expires={expires}&token={token}")

    logger.info(f"Lien de téléchargement généré pour annale id={annale.id} par user={request.user}")
    return Response({"url": pdf_url, "expires_in": 600})
