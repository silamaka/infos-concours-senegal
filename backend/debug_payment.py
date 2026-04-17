#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.providers import get_payment_provider

print('=== DEBUG PAYDUNYA ===')
print(f'PAYDUNYA_MASTER_KEY: {os.getenv("PAYDUNYA_MASTER_KEY", "NOT_SET")[:20]}...')
print(f'PAYDUNYA_PRIVATE_KEY: {os.getenv("PAYDUNYA_PRIVATE_KEY", "NOT_SET")[:20]}...')
print(f'PAYDUNYA_PUBLIC_KEY: {os.getenv("PAYDUNYA_PUBLIC_KEY", "NOT_SET")[:20]}...')
print(f'PAYDUNYA_TOKEN: {os.getenv("PAYDUNYA_TOKEN", "NOT_SET")[:20]}...')
print(f'PAYDUNYA_MODE: {os.getenv("PAYDUNYA_MODE", "NOT_SET")}')
print(f'PAYMENT_PROVIDER_MODE: {os.getenv("PAYMENT_PROVIDER_MODE", "NOT_SET")}')

try:
    # Test mode mock
    provider = get_payment_provider('paydunya', 'mock')
    print(f'✅ Provider mock: {type(provider)}')
    
    # Test mode live (avec clés)
    provider = get_payment_provider('paydunya', 'live')
    print(f'✅ Provider live: {type(provider)}')
    
except Exception as e:
    print(f'❌ Erreur: {e}')
    import traceback
    traceback.print_exc()
