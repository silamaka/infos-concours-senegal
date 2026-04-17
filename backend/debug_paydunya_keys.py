#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.providers import get_payment_provider
from apps.payments.models import Payment
from apps.orders.models import Order
from apps.users.models import User

print('=== DEBUG PAYDUNYA KEYS ===')
print(f'MASTER_KEY: {os.getenv("PAYDUNYA_MASTER_KEY")}')
print(f'PRIVATE_KEY: {os.getenv("PAYDUNYA_PRIVATE_KEY")}')
print(f'PUBLIC_KEY: {os.getenv("PAYDUNYA_PUBLIC_KEY")}')
print(f'TOKEN: {os.getenv("PAYDUNYA_TOKEN")}')
print(f'MODE: {os.getenv("PAYDUNYA_MODE")}')
print(f'PROVIDER_MODE: {os.getenv("PAYMENT_PROVIDER_MODE")}')

try:
    # Test provider Paydunya
    provider = get_payment_provider('paydunya', 'live')
    print(f'Provider créé: {type(provider)}')
    
    # Test d'initiation avec un paiement fictif
    user = User.objects.first()
    if user:
        order = Order.objects.create(user=user, total=2500)
        payment = Payment.objects.create(
            order=order,
            provider='paydunya',
            phone='+221783326970',
            amount=2500,
            status='initiated'
        )
        
        print('Test d\'initiation Paydunya...')
        result = provider.initiate_payment(payment)
        print(f'Résultat: {result}')
        
except Exception as e:
    print(f'ERREUR: {e}')
    import traceback
    traceback.print_exc()
