from django.contrib import admin

from .models import Annale, Review
from .models_pack import Pack


@admin.register(Annale)
class AnnaleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "is_popular", "is_new", "year")
    list_filter = ("category", "is_popular", "is_new", "year")
    search_fields = ("title", "category")
    fields = ("title", "category", "price", "old_price", "is_popular", "is_new", "year", "description", "features", "pages", "image", "preview_url", "pdf_key")


@admin.register(Pack)
class PackAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "discount_percent", "created_at")
    search_fields = ("title",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("annale", "user", "rating", "created_at")
    search_fields = ("annale__title", "user__username", "comment")
    list_filter = ("rating", "created_at")
