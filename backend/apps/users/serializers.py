from django.conf import settings
from django.core.cache import cache
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


def _client_ip(request) -> str:
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def _cache_get(key: str, default=None):
    try:
        return cache.get(key, default)
    except Exception:
        return default


def _cache_set(key: str, value, timeout: int) -> None:
    try:
        cache.set(key, value, timeout=timeout)
    except Exception:
        return


def _cache_delete(key: str) -> None:
    try:
        cache.delete(key)
    except Exception:
        return


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "name", "role"]

    def get_name(self, obj: User) -> str:
        return f"{obj.first_name} {obj.last_name}".strip()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "role"]

    def validate_role(self, value):
        allowed_roles = {User.Role.USER}
        if value not in allowed_roles:
            raise serializers.ValidationError("Ce role n'est pas autorise via l'inscription.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        return token

    def validate(self, attrs):
        request = self.context.get("request")
        email = (attrs.get("email") or "").lower().strip()
        ip = _client_ip(request)
        lock_seconds = settings.LOGIN_LOCKOUT_SECONDS
        fail_limit = settings.LOGIN_FAILURE_LIMIT

        email_fail_key = f"login_fail_email:{email}"
        ip_fail_key = f"login_fail_ip:{ip}"
        email_lock_key = f"login_lock_email:{email}"
        ip_lock_key = f"login_lock_ip:{ip}"

        if _cache_get(email_lock_key) or _cache_get(ip_lock_key):
            raise serializers.ValidationError("Compte temporairement bloque. Reessayez plus tard.")

        try:
            data = super().validate(attrs)
        except Exception as exc:
            email_fails = _cache_get(email_fail_key, 0) + 1
            ip_fails = _cache_get(ip_fail_key, 0) + 1
            _cache_set(email_fail_key, email_fails, timeout=lock_seconds)
            _cache_set(ip_fail_key, ip_fails, timeout=lock_seconds)
            if email_fails >= fail_limit:
                _cache_set(email_lock_key, 1, timeout=lock_seconds)
            if ip_fails >= fail_limit:
                _cache_set(ip_lock_key, 1, timeout=lock_seconds)
            raise exc

        _cache_delete(email_fail_key)
        _cache_delete(ip_fail_key)
        _cache_delete(email_lock_key)
        _cache_delete(ip_lock_key)
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self):
        try:
            token = RefreshToken(self.validated_data["refresh"])
            token.blacklist()
        except TokenError:
            raise serializers.ValidationError("Token invalide ou déjà révoqué.")
