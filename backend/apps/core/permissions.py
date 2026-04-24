from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission personnalisée : autorise l'accès si l'utilisateur est propriétaire de l'objet ou admin/staff.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Propriétaire (attribut 'user' sur l'objet)
        if hasattr(obj, 'user') and obj.user == user:
            return True
        # Admin ou staff
        return user.is_staff or user.is_superuser
