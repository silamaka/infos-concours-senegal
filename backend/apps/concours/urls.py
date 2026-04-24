from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConcoursDetailView, ConcoursListView
from .admin_views import AdminConcoursViewSet

router = DefaultRouter()
router.register(r'admin/concours', AdminConcoursViewSet, basename='admin-concours')

urlpatterns = [
    path("", ConcoursListView.as_view(), name="concours-list"),
    path("<uuid:pk>/", ConcoursDetailView.as_view(), name="concours-detail"),
    path("", include(router.urls)),
]
