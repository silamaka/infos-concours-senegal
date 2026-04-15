from rest_framework import permissions, status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import ServiceRequest
from .serializers import ServiceRequestSerializer


class ServiceCreateView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def post(self, request):
        serializer = ServiceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service_request = serializer.save(user=request.user if request.user.is_authenticated else None)
        return Response(ServiceRequestSerializer(service_request).data, status=status.HTTP_201_CREATED)


class MyServiceRequestsView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        return ServiceRequest.objects.filter(user=self.request.user).order_by("-created_at")


