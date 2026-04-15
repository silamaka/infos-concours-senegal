from django.urls import path

from .views import MyServiceRequestsView, ServiceCreateView

urlpatterns = [
    path("", ServiceCreateView.as_view(), name="services-create"),
    path("me/", MyServiceRequestsView.as_view(), name="services-me"),
]
