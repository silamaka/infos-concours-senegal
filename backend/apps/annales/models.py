import uuid

from django.db import models


class Annale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=120)
    price = models.PositiveIntegerField()
    old_price = models.PositiveIntegerField(null=True, blank=True)
    is_popular = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    pages = models.PositiveIntegerField(default=0)
    year = models.PositiveIntegerField(default=2024)
    rating = models.FloatField(default=0)
    reviews = models.PositiveIntegerField(default=0)
    downloads = models.PositiveIntegerField(default=0)
    image = models.URLField(blank=True)
    preview_url = models.URLField(blank=True)
    pdf_key = models.CharField(max_length=512, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
