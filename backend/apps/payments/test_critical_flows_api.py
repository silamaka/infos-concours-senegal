import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.annales.models import Annale
from apps.orders.models import Order


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(
        email="critical@test.sn",
        password="StrongPass123",
        first_name="Critical",
        last_name="User",
    )


@pytest.fixture
def annale(db):
    return Annale.objects.create(
        title="Annale Critique",
        category="math",
        price=1500,
        pdf_key="dummy.pdf",
    )


def _create_order_for_user(client: APIClient, user, annale: Annale) -> str:
    client.force_authenticate(user=user)
    response = client.post(
        reverse("orders-create"),
        {"items": [{"annale_id": str(annale.id), "quantity": 1}]},
        format="json",
    )
    assert response.status_code == 201
    return response.data["id"]


@pytest.mark.django_db
def test_auth_login_returns_access_and_refresh_tokens(api_client: APIClient, user):
    response = api_client.post(
        reverse("auth-login"),
        {"email": user.email, "password": "StrongPass123"},
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["email"] == user.email


@pytest.mark.django_db
def test_auth_refresh_returns_new_access_token(api_client: APIClient, user):
    login_response = api_client.post(
        reverse("auth-login"),
        {"email": user.email, "password": "StrongPass123"},
        format="json",
    )
    assert login_response.status_code == 200

    refresh_response = api_client.post(
        reverse("auth-token-refresh"),
        {"refresh": login_response.data["refresh"]},
        format="json",
    )

    assert refresh_response.status_code == 200
    assert "access" in refresh_response.data


@pytest.mark.django_db
def test_mock_payment_initiation_returns_payment_url_and_id(
    api_client: APIClient,
    user,
    annale: Annale,
    monkeypatch,
):
    monkeypatch.setenv("PAYMENT_PROVIDER_MODE", "mock")

    order_id = _create_order_for_user(api_client, user, annale)
    response = api_client.post(
        reverse("payments-initiate"),
        {
            "order_id": order_id,
            "provider": "paydunya",
            "phone": "+221783332697",
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["mock_mode"] is True
    assert response.data["payment_id"]
    assert "mock-payments.local" in response.data["payment_url"]


@pytest.mark.django_db
def test_mock_confirm_marks_order_paid_and_visible_in_my_orders(
    api_client: APIClient,
    user,
    annale: Annale,
    monkeypatch,
):
    monkeypatch.setenv("PAYMENT_PROVIDER_MODE", "mock")

    order_id = _create_order_for_user(api_client, user, annale)

    payment_response = api_client.post(
        reverse("payments-initiate"),
        {
            "order_id": order_id,
            "provider": "paydunya",
            "phone": "+221783332697",
        },
        format="json",
    )
    assert payment_response.status_code == 200

    payment_id = payment_response.data["payment_id"]
    confirm_response = api_client.post(
        reverse("payments-mock-confirm", kwargs={"pk": payment_id}),
        {"status": "paid"},
        format="json",
    )

    assert confirm_response.status_code == 200
    assert confirm_response.data["status"] == "paid"

    order = Order.objects.get(pk=order_id)
    assert order.status == "paid"

    my_orders_response = api_client.get(reverse("orders-me"))
    assert my_orders_response.status_code == 200
    rows = my_orders_response.data.get("results", [])
    assert any(item["id"] == order_id and item["status"] == "paid" for item in rows)


@pytest.mark.django_db
def test_register_creates_account_and_login_works(api_client: APIClient):
    """Parcours inscription : un nouveau compte peut s'inscrire puis se connecter."""
    register_response = api_client.post(
        reverse("auth-register"),
        {
            "email": "nouveau@test.sn",
            "password": "NewPass456!",
            "first_name": "Nouveau",
            "last_name": "Membre",
        },
        format="json",
    )
    assert register_response.status_code == 201, register_response.data

    login_response = api_client.post(
        reverse("auth-login"),
        {"email": "nouveau@test.sn", "password": "NewPass456!"},
        format="json",
    )
    assert login_response.status_code == 200
    assert "access" in login_response.data
    assert login_response.data["user"]["email"] == "nouveau@test.sn"


@pytest.mark.django_db
def test_download_blocked_without_payment_and_allowed_after_payment(
    api_client: APIClient,
    user,
    annale: Annale,
    monkeypatch,
    tmp_path,
):
    """Parcours accès contenu : téléchargement refusé sans achat, autorisé après paiement."""
    # Créer un vrai fichier PDF bidon pour que le chemin existe
    import os
    from django.conf import settings

    pdf_dir = os.path.join(settings.MEDIA_ROOT, "annales")
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_filename = "dummy_test.pdf"
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    with open(pdf_path, "wb") as f:
        f.write(b"%PDF-1.4 dummy")

    annale.pdf_key = pdf_filename
    annale.save()

    monkeypatch.setenv("PAYMENT_PROVIDER_MODE", "mock")
    api_client.force_authenticate(user=user)

    # Avant achat : 403
    dl_response = api_client.get(reverse("annales-download", kwargs={"pk": str(annale.id)}))
    assert dl_response.status_code == 403

    # Créer commande et payer
    order_id = _create_order_for_user(api_client, user, annale)
    pay_response = api_client.post(
        reverse("payments-initiate"),
        {"order_id": order_id, "provider": "paydunya", "phone": "+221783332697"},
        format="json",
    )
    assert pay_response.status_code == 200
    payment_id = pay_response.data["payment_id"]

    api_client.post(
        reverse("payments-mock-confirm", kwargs={"pk": payment_id}),
        {"status": "paid"},
        format="json",
    )

    # Après achat : lien de téléchargement retourné
    api_client.force_authenticate(user=user)
    dl_response = api_client.get(reverse("annales-download", kwargs={"pk": str(annale.id)}))
    assert dl_response.status_code == 200
    assert "url" in dl_response.data
