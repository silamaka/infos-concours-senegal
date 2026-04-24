import uuid
from django.db import models
from django.conf import settings

class Pack(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField()
    discount_percent = models.PositiveIntegerField(default=0)
    annales = models.ManyToManyField('annales.Annale', related_name='packs')
    image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def discounted_price(self):
        if self.discount_percent:
            return int(self.price * (100 - self.discount_percent) / 100)
        return self.price
