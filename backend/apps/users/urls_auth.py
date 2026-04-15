from django.urls import path

from .views import LoginView, LogoutView, RegisterView, V1TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", V1TokenRefreshView.as_view(), name="auth-token-refresh"),
]
