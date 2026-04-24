from rest_framework import permissions, viewsets
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .models import Concours
from .serializers import ConcoursSerializer

class AdminConcoursViewSet(viewsets.ModelViewSet):
    queryset = Concours.objects.all()
    serializer_class = ConcoursSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [permissions.IsAdminUser]
