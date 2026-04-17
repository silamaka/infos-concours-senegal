from rest_framework import serializers

from .models import ServiceRequest


class ServiceRequestSerializer(serializers.ModelSerializer):
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
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]
