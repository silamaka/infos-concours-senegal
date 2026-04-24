import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def admin_user(db) -> User:
    return User.objects.create_user(
        email="admin@test.sn",
        password="StrongPass123",
        first_name="Admin",
        last_name="Root",
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def staff_user(db) -> User:
    return User.objects.create_user(
        email="staff@test.sn",
        password="StrongPass123",
        first_name="Staff",
        last_name="Agent",
        role=User.Role.STAFF,
        is_staff=True,
    )


@pytest.fixture
def normal_user(db) -> User:
    return User.objects.create_user(
        email="user@test.sn",
        password="StrongPass123",
        first_name="Normal",
        last_name="User",
        role=User.Role.USER,
        is_staff=False,
    )


def auth(client: APIClient, user: User) -> None:
    client.force_authenticate(user=user)


@pytest.mark.django_db
def test_staff_cannot_access_admin_users_list(api_client: APIClient, staff_user: User):
    auth(api_client, staff_user)

    url = reverse("admin-users")
    res = api_client.get(url)

    assert res.status_code == 403


@pytest.mark.django_db
def test_staff_cannot_access_admin_audit_logs(api_client: APIClient, staff_user: User):
    auth(api_client, staff_user)

    url = reverse("admin-audit-logs")
    res = api_client.get(url)

    assert res.status_code == 403


@pytest.mark.django_db
def test_admin_can_access_admin_audit_logs(api_client: APIClient, admin_user: User, normal_user: User):
    auth(api_client, admin_user)

    update_url = reverse("admin-users-detail", kwargs={"pk": normal_user.id})
    patch_res = api_client.patch(update_url, {"first_name": "Audit"}, format="json")
    assert patch_res.status_code == 200

    url = reverse("admin-audit-logs")
    res = api_client.get(url)

    assert res.status_code == 200
    rows = res.data if isinstance(res.data, list) else res.data.get("results", [])
    assert any(item["action"] == "admin_user_updated" for item in rows)


@pytest.mark.django_db
def test_admin_users_list_is_paginated_and_sortable(api_client: APIClient, admin_user: User):
    User.objects.create_user(
        email="zeta@test.sn",
        password="StrongPass123",
        first_name="Zeta",
        last_name="User",
        role=User.Role.USER,
    )
    User.objects.create_user(
        email="alpha@test.sn",
        password="StrongPass123",
        first_name="Alpha",
        last_name="User",
        role=User.Role.USER,
    )

    auth(api_client, admin_user)
    url = reverse("admin-users")
    res = api_client.get(url, {"page_size": 1, "ordering": "email"})

    assert res.status_code == 200
    assert "count" in res.data
    assert "results" in res.data
    assert len(res.data["results"]) == 1
    assert res.data["results"][0]["email"] == "admin@test.sn"


@pytest.mark.django_db
def test_admin_can_patch_user_email_and_password(
    api_client: APIClient,
    admin_user: User,
    normal_user: User,
):
    auth(api_client, admin_user)

    url = reverse("admin-users-detail", kwargs={"pk": normal_user.id})
    res = api_client.patch(
        url,
        {
            "email": "updated.user@test.sn",
            "first_name": "Updated",
            "last_name": "Name",
            "password": "NewSecurePass123",
        },
        format="json",
    )

    assert res.status_code == 200
    normal_user.refresh_from_db()
    assert normal_user.email == "updated.user@test.sn"
    assert normal_user.first_name == "Updated"
    assert normal_user.last_name == "Name"
    assert normal_user.check_password("NewSecurePass123")


@pytest.mark.django_db
def test_admin_cannot_disable_self(api_client: APIClient, admin_user: User):
    auth(api_client, admin_user)

    url = reverse("admin-users-detail", kwargs={"pk": admin_user.id})
    res = api_client.patch(url, {"is_active": False}, format="json")

    assert res.status_code == 400
    assert "Impossible de désactiver votre propre compte" in res.data["message"]


@pytest.mark.django_db
def test_admin_cannot_delete_self(api_client: APIClient, admin_user: User):
    auth(api_client, admin_user)

    url = reverse("admin-users-detail", kwargs={"pk": admin_user.id})
    res = api_client.delete(url)

    assert res.status_code == 400
    assert "Suppression de votre propre compte interdite" in res.data["message"]
