from django.urls import path

from .views import AnnaleDetailView, AnnaleListView, annale_download_view, annale_preview_view, PackListView, PackDetailView, ReviewListCreateView, annale_pdf_serve_view

urlpatterns = [
    path("", AnnaleListView.as_view(), name="annales-list"),
    path("<uuid:pk>/", AnnaleDetailView.as_view(), name="annales-detail"),
    path("<uuid:pk>/preview/", annale_preview_view, name="annales-preview"),
    path("<uuid:pk>/download/", annale_download_view, name="annales-download"),

    # Lien sécurisé pour servir le PDF
    path("pdf/<str:pdf_key>", annale_pdf_serve_view, name="annales-pdf-serve"),

    # Reviews (notes/commentaires)
    path("<uuid:annale_id>/reviews/", ReviewListCreateView.as_view(), name="annales-reviews"),

    # Packs (bundles)
    path("packs/", PackListView.as_view(), name="packs-list"),
    path("packs/<uuid:pk>/", PackDetailView.as_view(), name="packs-detail"),
]
