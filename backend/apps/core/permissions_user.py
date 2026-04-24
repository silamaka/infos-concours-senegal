from rest_framework import permissions

class IsAdminOrStaffButNotUserManager(permissions.BasePermission):
    """
    Autorise :
    - admin (is_superuser) : tout
    - staff (is_staff) : tout sauf gestion utilisateurs
    - user : jamais
    Utiliser sur les endpoints de gestion utilisateurs.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if user.is_staff:
            # On suppose que la vue a un attribut 'user_management' pour signaler la gestion utilisateurs
            return not getattr(view, 'user_management', False)
        return False
