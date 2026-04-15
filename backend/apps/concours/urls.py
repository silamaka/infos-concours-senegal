from django.urls import path

from .views import ConcoursDetailView, ConcoursListView

urlpatterns = [
    path("", ConcoursListView.as_view(), name="concours-list"),
    path("<uuid:pk>/", ConcoursDetailView.as_view(), name="concours-detail"),
]
