from rest_framework import permissions
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Concours
from .serializers import ConcoursSerializer


class ConcoursListView(ListAPIView):
    serializer_class = ConcoursSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Concours.objects.all()
    filterset_fields = ["category", "status"]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["deadline", "date", "rating"]


class ConcoursDetailView(RetrieveAPIView):
    serializer_class = ConcoursSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Concours.objects.all()
