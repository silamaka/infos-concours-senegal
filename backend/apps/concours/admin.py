from django.contrib import admin

from .models import Concours


@admin.register(Concours)
class ConcoursAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status_fr", "deadline", "is_featured")
    list_filter = ("category", "status", "is_featured")
    search_fields = ("title", "category", "location")
    fields = ("title", "category", "date", "description", "registration_url", "location", "deadline", "status", "image", "rating", "reviews", "is_featured", "conditions")

    def status_fr(self, obj):
        mapping = {
            "open": "Ouvert",
            "closed": "Fermé",
            "upcoming": "À venir",
            "Ouvert": "Ouvert",
            "Fermé": "Fermé",
            "À venir": "À venir",
        }
        return mapping.get(str(obj.status).strip().lower(), obj.status)
    status_fr.short_description = "Statut"
