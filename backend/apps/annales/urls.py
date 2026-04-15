from django.urls import path

from .views import AnnaleDetailView, AnnaleListView, annale_download_view, annale_preview_view

urlpatterns = [
    path("", AnnaleListView.as_view(), name="annales-list"),
    path("<uuid:pk>/", AnnaleDetailView.as_view(), name="annales-detail"),
    path("<uuid:pk>/preview/", annale_preview_view, name="annales-preview"),
    path("<uuid:pk>/download/", annale_download_view, name="annales-download"),
]
