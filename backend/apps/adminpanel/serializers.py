from rest_framework import serializers

from apps.annales.models import Annale
from apps.concours.models import Concours
from apps.contact.models import ContactMessage
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.services.models import ServiceRequest
from apps.users.models import User
from .models import AdminAuditLog


class AdminAnnaleSerializer(serializers.ModelSerializer):
    oldPrice = serializers.IntegerField(source="old_price", allow_null=True, required=False)
    isPopular = serializers.BooleanField(source="is_popular", required=False)
    isNew = serializers.BooleanField(source="is_new", required=False)

    class Meta:
        model = Annale
        fields = [
            "id",
            "title",
            "category",
            "price",
            "oldPrice",
            "isPopular",
            "isNew",
            "description",
            "pages",
            "year",
            "rating",
            "reviews",
            "downloads",
            "image",
            "preview_url",
            "pdf_key",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminConcoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concours
        fields = [
            "id",
            "title",
            "category",
            "date",
            "description",
            "location",
            "deadline",
            "status",
            "image",
            "rating",
            "reviews",
            "is_featured",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = ["id", "user_email", "status", "total", "created_at", "updated_at"]


class AdminPaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(source="order.id", read_only=True)
    user_email = serializers.EmailField(source="order.user.email", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order_id",
            "user_email",
            "provider",
            "phone",
            "amount",
            "status",
            "provider_reference",
            "created_at",
            "updated_at",
        ]


class AdminServiceSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", allow_null=True, read_only=True)
    attachment_file_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "service_type",
            "name",
            "email",
            "phone",
            "target",
            "details",
            "attachment_file",
            "attachment_file_url",
            "status",
            "user_email",
            "created_at",
        ]

    def get_attachment_file_url(self, obj):
        if obj.attachment_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment_file.url)
            return obj.attachment_file.url
        return None


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]
        read_only_fields = ["id", "is_superuser", "date_joined"]

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "Le mot de passe est obligatoire à la création."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.get("role", User.Role.USER)
        validated_data["is_staff"] = role in {User.Role.STAFF, User.Role.ADMIN}
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        role = validated_data.get("role")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if role is not None:
            instance.is_staff = role in {User.Role.STAFF, User.Role.ADMIN}

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class AdminContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "is_processed", "created_at"]


class AdminAuditLogSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(source="admin_user.email", allow_null=True, read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = [
            "id",
            "action",
            "target_type",
            "target_id",
            "details",
            "admin_email",
            "created_at",
        ]
