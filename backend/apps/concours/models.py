import uuid

from django.db import models


class Concours(models.Model):
    STATUS_CHOICES = [
        ("open", "Ouvert"),
        ("closed", "Fermé"),
        ("upcoming", "À venir"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=120)
    date = models.DateField()
    description = models.TextField(blank=True)
    registration_url = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    deadline = models.DateField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="open")
    image = models.URLField(blank=True)
    rating = models.FloatField(default=0)
    reviews = models.PositiveIntegerField(default=0)

    is_featured = models.BooleanField(default=False)
    conditions = models.TextField(
        blank=True,
        verbose_name="Pièces à fournir",
        help_text="Pièces à fournir pour postuler (une pièce par ligne)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["deadline", "-created_at"]
