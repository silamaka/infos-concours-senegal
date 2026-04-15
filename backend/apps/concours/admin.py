from django.contrib import admin

from .models import Concours


@admin.register(Concours)
class ConcoursAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "deadline", "is_featured")
    list_filter = ("category", "status", "is_featured")
    search_fields = ("title", "category", "location")
