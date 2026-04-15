from django.contrib import admin

from .models import Annale


@admin.register(Annale)
class AnnaleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "is_popular", "is_new", "year")
    list_filter = ("category", "is_popular", "is_new", "year")
    search_fields = ("title", "category")
