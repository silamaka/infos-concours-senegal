import uuid

from django.conf import settings
from django.db import models


class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("in_progress", "In progress"),
        ("delivered", "Delivered"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_requests",
        null=True,
        blank=True,
    )
    service_type = models.CharField(max_length=60)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=32)
    target = models.CharField(max_length=255, blank=True)
    details = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    created_at = models.DateTimeField(auto_now_add=True)
