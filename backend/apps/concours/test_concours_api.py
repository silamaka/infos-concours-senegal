import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.concours.models import Concours


pytestmark = pytest.mark.django_db


def test_concours_detail_returns_registration_url():
    concours = Concours.objects.create(
        title="Concours ENA",
        category="Administration",
        date="2026-05-20",
        description="Description",
        registration_url="https://ena.sn/inscription",
        location="Dakar",
        deadline="2026-05-10",
        status="Ouvert",
    )

    client = APIClient()
    response = client.get(reverse("concours-detail", kwargs={"pk": concours.id}))

    assert response.status_code == 200
    assert response.data["registration_url"] == "https://ena.sn/inscription"


def test_concours_list_includes_registration_url_field():
    Concours.objects.create(
        title="Concours EPS",
        category="Education",
        date="2026-06-15",
        description="Description",
        registration_url="https://eps.sn/candidature",
        location="Thiès",
        deadline="2026-06-01",
        status="Ouvert",
    )

    client = APIClient()
    response = client.get(reverse("concours-list"))

    assert response.status_code == 200
    rows = response.data.get("results", [])
    assert rows
    assert "registration_url" in rows[0]