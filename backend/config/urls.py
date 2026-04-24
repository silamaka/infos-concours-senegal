
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

# Swagger/OpenAPI (drf-yasg)
from rest_framework import permissions as drf_permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Infos Concours Sénégal API",
        default_version='v1',
        description="Documentation interactive de l'API",
    ),
    public=True,
    permission_classes=(drf_permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/admin/", include("apps.adminpanel.urls")),
    path("api/v1/auth/", include("apps.users.urls_auth")),
    path("api/v1/users/", include("apps.users.urls_users")),
    path("api/v1/annales/", include("apps.annales.urls")),
    path("api/v1/concours/", include("apps.concours.urls")),
    path("api/v1/orders/", include("apps.orders.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/services/", include("apps.services.urls")),
    path("api/v1/contact/", include("apps.contact.urls")),

    # Documentation Swagger/OpenAPI
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
