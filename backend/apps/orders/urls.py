from django.urls import path

from .views import MyOrdersView, OrderCreateView, OrderDetailView

urlpatterns = [
    path("", OrderCreateView.as_view(), name="orders-create"),
    path("me/", MyOrdersView.as_view(), name="orders-me"),
    path("<uuid:pk>/", OrderDetailView.as_view(), name="orders-detail"),
]
