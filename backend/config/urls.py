from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
