from typing import Any

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ErrorDetail
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def _normalize_error(detail: Any) -> str:
    if isinstance(detail, dict):
        first_key = next(iter(detail), None)
        if first_key is None:
            return "Une erreur est survenue"
        return _normalize_error(detail[first_key])
    if isinstance(detail, list):
        if not detail:
            return "Une erreur est survenue"
        return _normalize_error(detail[0])
    if isinstance(detail, ErrorDetail):
        return str(detail)
    if isinstance(detail, DjangoValidationError):
        return "; ".join(detail.messages)
    if detail is None:
        return "Une erreur est survenue"
    return str(detail)


def api_exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    response = drf_exception_handler(exc, context)
    if response is None:
        return Response({"message": "Erreur interne du serveur"}, status=500)

    message = _normalize_error(response.data)
    response.data = {"message": message}
    return response
