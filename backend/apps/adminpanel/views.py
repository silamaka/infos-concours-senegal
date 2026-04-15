import os
import logging
from uuid import uuid4

from django.core.files.storage import default_storage
from django.db.models import Sum
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.annales.models import Annale
from apps.concours.models import Concours
from apps.contact.models import ContactMessage
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.services.models import ServiceRequest
from apps.users.models import User
from apps.users.permissions import IsAdminOnlyRole, IsAdminOrStaffRole

from .models import AdminAuditLog
from .serializers import (
    AdminAuditLogSerializer,
    AdminAnnaleSerializer,
    AdminConcoursSerializer,
    AdminContactSerializer,
    AdminOrderSerializer,
    AdminPaymentSerializer,
    AdminServiceSerializer,
    AdminUserSerializer,
)

audit_logger = logging.getLogger("apps.adminpanel.audit")


def record_admin_audit(request, action: str, target_type: str, target_id: str = "", details: dict | None = None):
    payload = details or {}
    try:
        AdminAuditLog.objects.create(
            admin_user=request.user if getattr(request.user, "is_authenticated", False) else None,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=payload,
        )
    except Exception:
        pass

    audit_logger.info(
        action,
        extra={
            "admin_user_id": str(getattr(request.user, "id", "")),
            "target_type": target_type,
            "target_id": target_id,
            "details": payload,
        },
    )


class AdminStatsView(APIView):
    permission_classes = [IsAdminOrStaffRole]

    def get(self, request):
        revenue = Payment.objects.filter(status="paid").aggregate(total=Sum("amount"))["total"] or 0
        orders_count = Order.objects.count()
        users_count = User.objects.count()
        annales_sold = (
            OrderItem.objects.filter(order__status="paid").aggregate(total=Sum("quantity"))["total"] or 0
        )

        return Response(
            {
                "total_revenue": revenue,
                "orders_count": orders_count,
                "users_count": users_count,
                "annales_sold": annales_sold,
            }
        )


class AdminOverviewView(APIView):
    permission_classes = [IsAdminOrStaffRole]

    def get(self, request):
        counts = {
            "users": User.objects.count(),
            "annales": Annale.objects.count(),
            "concours": Concours.objects.count(),
            "orders": Order.objects.count(),
            "payments": Payment.objects.count(),
            "contact_messages": ContactMessage.objects.count(),
            "service_requests": ServiceRequest.objects.count(),
        }

        recent_orders = [
            {
                "id": str(order.id),
                "user_email": order.user.email,
                "status": order.status,
                "total": order.total,
                "created_at": order.created_at,
            }
            for order in Order.objects.select_related("user").order_by("-created_at")[:5]
        ]

        recent_contacts = [
            {
                "id": str(item.id),
                "name": item.name,
                "email": item.email,
                "subject": item.subject,
                "is_processed": item.is_processed,
                "created_at": item.created_at,
            }
            for item in ContactMessage.objects.order_by("-created_at")[:5]
        ]

        recent_service_requests = [
            {
                "id": str(item.id),
                "name": item.name,
                "email": item.email,
                "service_type": item.service_type,
                "status": item.status,
                "created_at": item.created_at,
            }
            for item in ServiceRequest.objects.order_by("-created_at")[:5]
        ]

        return Response(
            {
                "counts": counts,
                "recent_orders": recent_orders,
                "recent_contacts": recent_contacts,
                "recent_service_requests": recent_service_requests,
            }
        )


class AdminAnnalesView(ListCreateAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminAnnaleSerializer
    queryset = Annale.objects.all().order_by("-created_at")


class AdminAnnaleDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminAnnaleSerializer
    queryset = Annale.objects.all()


class AdminConcoursView(ListCreateAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminConcoursSerializer
    queryset = Concours.objects.all().order_by("-created_at")


class AdminConcoursDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminConcoursSerializer
    queryset = Concours.objects.all()


class AdminOrdersView(ListAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminOrderSerializer
    queryset = Order.objects.select_related("user").all().order_by("-created_at")


class AdminOrderDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminOrderSerializer
    queryset = Order.objects.select_related("user").all()

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        status_value = request.data.get("status")
        if status_value not in {"pending", "paid", "failed"}:
            return Response({"message": "Statut invalide"}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = status_value
        instance.save(update_fields=["status", "updated_at"])
        record_admin_audit(request, "admin_order_status_updated", "order", str(instance.id), {"status": status_value})
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AdminPaymentsView(ListAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminPaymentSerializer
    queryset = Payment.objects.select_related("order", "order__user").all().order_by("-created_at")


class AdminAuditLogsView(ListAPIView):
    permission_classes = [IsAdminOnlyRole]
    serializer_class = AdminAuditLogSerializer
    queryset = AdminAuditLog.objects.select_related("admin_user").all().order_by("-created_at")



class AdminServicesView(ListAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminServiceSerializer
    queryset = ServiceRequest.objects.select_related("user").all().order_by("-created_at")


class AdminServiceDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminServiceSerializer
    queryset = ServiceRequest.objects.select_related("user").all()

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        status_value = request.data.get("status")
        if status_value not in {"submitted", "in_progress", "delivered"}:
            return Response({"message": "Statut invalide"}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = status_value
        instance.save(update_fields=["status"])
        record_admin_audit(request, "admin_service_status_updated", "service", str(instance.id), {"status": status_value})
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminContactPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUsersPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUsersView(ListCreateAPIView):
    permission_classes = [IsAdminOnlyRole]
    serializer_class = AdminUserSerializer
    pagination_class = AdminUsersPagination
    queryset = User.objects.all().order_by("-date_joined")
    ordering_fields = ["date_joined", "email", "first_name", "last_name", "role", "is_active"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        search = (self.request.query_params.get("search") or "").strip()

        if role in {User.Role.USER, User.Role.STAFF, User.Role.ADMIN}:
            queryset = queryset.filter(role=role)
        if is_active in {"true", "false"}:
            queryset = queryset.filter(is_active=(is_active == "true"))
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        return queryset

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        record_admin_audit(
            request,
            "admin_user_created",
            "user",
            str(user.id),
            {"role": user.role, "is_active": user.is_active},
        )
        return Response(self.get_serializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOnlyRole]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        if str(instance.id) == str(request.user.id) and "role" in request.data and request.data.get("role") != User.Role.ADMIN:
            return Response({"message": "Impossible de rétrograder votre propre compte admin"}, status=status.HTTP_400_BAD_REQUEST)

        if str(instance.id) == str(request.user.id) and request.data.get("is_active") is False:
            return Response({"message": "Impossible de désactiver votre propre compte"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        record_admin_audit(
            request,
            "admin_user_updated",
            "user",
            str(updated_user.id),
            {"updated_fields": sorted(list(request.data.keys()))},
        )
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if str(instance.id) == str(request.user.id):
            return Response({"message": "Suppression de votre propre compte interdite"}, status=status.HTTP_400_BAD_REQUEST)
        record_admin_audit(
            request,
            "admin_user_deleted",
            "user",
            str(instance.id),
            {"target_user_email": instance.email},
        )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminContactsView(ListAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminContactSerializer
    pagination_class = AdminContactPagination
    queryset = ContactMessage.objects.all().order_by("-created_at")

    def get_queryset(self):
        queryset = ContactMessage.objects.all().order_by("-created_at")
        is_processed = self.request.query_params.get("is_processed")
        search = (self.request.query_params.get("search") or "").strip()

        if is_processed in {"true", "false"}:
            queryset = queryset.filter(is_processed=(is_processed == "true"))
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(name__icontains=search)
                | Q(subject__icontains=search)
                | Q(message__icontains=search)
            )

        return queryset


class AdminContactDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffRole]
    serializer_class = AdminContactSerializer
    queryset = ContactMessage.objects.all()

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        is_processed = request.data.get("is_processed")
        if not isinstance(is_processed, bool):
            return Response({"message": "Champ is_processed invalide"}, status=status.HTTP_400_BAD_REQUEST)

        instance.is_processed = is_processed
        instance.save(update_fields=["is_processed"])
        record_admin_audit(
            request,
            "admin_contact_processed_updated",
            "contact",
            str(instance.id),
            {"is_processed": is_processed},
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AdminImageUploadView(APIView):
    permission_classes = [IsAdminOrStaffRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"message": "Fichier manquant"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(file_obj, "content_type", "") or ""
        if not content_type.startswith("image/"):
            return Response({"message": "Le fichier doit être une image"}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj.size > 5 * 1024 * 1024:
            return Response({"message": "Image trop volumineuse (max 5MB)"}, status=status.HTTP_400_BAD_REQUEST)

        _, ext = os.path.splitext(file_obj.name or "")
        ext = (ext or ".jpg").lower()
        storage_path = default_storage.save(f"annales/{uuid4().hex}{ext}", file_obj)
        file_url = request.build_absolute_uri(default_storage.url(storage_path))
        return Response({"url": file_url, "path": storage_path}, status=status.HTTP_201_CREATED)


class AdminPdfUploadView(APIView):
    permission_classes = [IsAdminOrStaffRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"message": "Fichier PDF manquant"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(file_obj, "content_type", "") or ""
        _, ext = os.path.splitext(file_obj.name or "")
        ext = (ext or "").lower()
        is_pdf = content_type == "application/pdf" or ext == ".pdf"
        if not is_pdf:
            return Response({"message": "Le fichier doit être un PDF"}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj.size > 25 * 1024 * 1024:
            return Response({"message": "PDF trop volumineux (max 25MB)"}, status=status.HTTP_400_BAD_REQUEST)

        storage_path = default_storage.save(f"annales/pdfs/{uuid4().hex}.pdf", file_obj)
        file_url = request.build_absolute_uri(default_storage.url(storage_path))
        return Response({"url": file_url, "path": storage_path}, status=status.HTTP_201_CREATED)
