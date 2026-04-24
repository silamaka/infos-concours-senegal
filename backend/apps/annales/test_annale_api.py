import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.annales.models import Annale
from django.contrib.auth import get_user_model
from apps.orders.models import Order, OrderItem
from urllib.parse import urlsplit
from pathlib import Path

pytestmark = pytest.mark.django_db


def test_annale_list_view():
    Annale.objects.create(title="Test Annale", category="math", price=100)
    client = APIClient()
    url = reverse("annales-list")
    response = client.get(url)
    assert response.status_code == 200
    assert response.data["results"]


def test_annale_detail_view():
    annale = Annale.objects.create(title="Test Annale", category="math", price=100)
    client = APIClient()
    url = reverse("annales-detail", args=[annale.id])
    response = client.get(url)
    assert response.status_code == 200
    assert response.data["title"] == "Test Annale"


def test_annale_download_requires_auth():
    annale = Annale.objects.create(title="Test Annale", category="math", price=100, pdf_key="dummy.pdf")
    url = reverse("annales-download", args=[annale.id])
    client = APIClient()
    response = client.get(url)
    assert response.status_code == 401  # Non authentifié


def test_annale_download_requires_payment():
    User = get_user_model()
    user = User.objects.create_user(email="testuser@example.com", password="pass")
    annale = Annale.objects.create(title="Test Annale", category="math", price=100, pdf_key="dummy.pdf")
    url = reverse("annales-download", args=[annale.id])
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get(url)
    assert response.status_code == 403  # Achat requis


def test_annale_download_paid_allows_signed_url_with_legacy_pdf_key(settings):
    settings.MEDIA_ROOT = Path(settings.BASE_DIR) / "media"
    pdf_rel = "annales/pdfs/test-download.pdf"
    pdf_abs = Path(settings.MEDIA_ROOT) / pdf_rel
    pdf_abs.parent.mkdir(parents=True, exist_ok=True)
    pdf_abs.write_bytes(b"%PDF-1.4\n% Test file\n")

    User = get_user_model()
    user = User.objects.create_user(email="paid-user@example.com", password="pass")
    annale = Annale.objects.create(
        title="Annale Payee",
        category="math",
        price=100,
        # Ancien format observé en base (URL complète)
        pdf_key="http://localhost:8000/media/annales/pdfs/test-download.pdf",
    )

    order = Order.objects.create(user=user, status="paid", total=100)
    OrderItem.objects.create(order=order, annale=annale, quantity=1, unit_price=100)

    client = APIClient()
    client.force_authenticate(user=user)

    download_url = reverse("annales-download", args=[annale.id])
    response = client.get(download_url)
    assert response.status_code == 200
    assert "url" in response.data
    assert "/api/v1/annales/pdf/" in response.data["url"]

    signed_url = response.data["url"]
    parts = urlsplit(signed_url)
    signed_path = f"{parts.path}?{parts.query}"
    file_response = client.get(signed_path)
    assert file_response.status_code == 200
    assert file_response["Content-Type"] == "application/pdf"
