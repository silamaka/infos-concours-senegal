from django.urls import path

from .views import PaymentInitiateView, PaymentMockConfirmView, PaymentStatusView, payment_webhook_view

urlpatterns = [
    path("initiate/", PaymentInitiateView.as_view(), name="payments-initiate"),
    path("<uuid:pk>/status/", PaymentStatusView.as_view(), name="payments-status"),
    path("<uuid:pk>/mock-confirm/", PaymentMockConfirmView.as_view(), name="payments-mock-confirm"),
    path("webhook/", payment_webhook_view, name="payments-webhook"),
]
