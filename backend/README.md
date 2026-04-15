# Infos Concours Senegal - Backend v1

Backend Django/DRF compatible with React frontend using `/api/v1/` routes.

## Quick start

1. Create and activate a virtual environment
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment from `.env.example`
4. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

5. Start server:

```bash
python manage.py runserver
```

## Demo data (recommended for frontend integration)

Populate annales and concours sample data:

```bash
python manage.py seed_demo_data --reset
```

## Main endpoints

- POST `/api/v1/auth/register/`
- POST `/api/v1/auth/login/`
- POST `/api/v1/auth/logout/`
- POST `/api/v1/auth/token/refresh/`
- GET `/api/v1/users/me/`
- GET `/api/v1/annales/`
- GET `/api/v1/annales/{id}/`
- GET `/api/v1/annales/{id}/preview/`
- GET `/api/v1/annales/{id}/download/`
- GET `/api/v1/concours/`
- GET `/api/v1/concours/{id}/`
- POST `/api/v1/orders/`
- GET `/api/v1/orders/me/`
- GET `/api/v1/orders/{id}/`
- POST `/api/v1/payments/initiate/`
- GET `/api/v1/payments/{id}/status/`
- POST `/api/v1/services/`
- GET `/api/v1/services/me/`
- POST `/api/v1/contact/`

## Error format

All API errors return:

```json
{ "message": "Erreur lisible" }
```

## Payment mode before Wave/Orange integration

Use mock mode while provider APIs are not ready:

```bash
PAYMENT_PROVIDER_MODE=mock
```

In mock mode:

- `POST /api/v1/payments/initiate/` returns `mock_mode: true`
- `POST /api/v1/payments/{payment_id}/mock-confirm/` confirms payment (`paid` or `failed`)

This keeps orders/payments/download flows testable end-to-end without external gateways.

## Provider architecture

Payment providers are isolated in:

- `apps/payments/providers/gateways.py`

Current behavior:

- `PAYMENT_PROVIDER_MODE=mock`: uses `MockPaymentProvider`
- `PAYMENT_PROVIDER_MODE=live`: routes to provider-specific classes (`WavePaymentProvider`, `OrangePaymentProvider`)

When real credentials/APIs are ready, implement `initiate_payment` inside:

- `WavePaymentProvider`
- `OrangePaymentProvider`

No change needed in API views or frontend flow.
