from django.contrib import admin

from .models import ServiceRequest


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "service_type", "email", "status", "created_at")
    list_filter = ("service_type", "status", "created_at")
    search_fields = ("id", "name", "email")
