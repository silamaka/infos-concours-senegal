from rest_framework import permissions

from .models import User


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "role", None) == User.Role.ADMIN or user.is_superuser)
        )


class IsAdminOrStaffRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                getattr(user, "role", None) in {User.Role.ADMIN, User.Role.STAFF}
                or user.is_staff
                or user.is_superuser
            )
        )


class IsAdminOnlyRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "role", None) == User.Role.ADMIN or user.is_superuser)
        )
