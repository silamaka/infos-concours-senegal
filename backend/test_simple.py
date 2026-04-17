#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

# Créer un user de test
user = User.objects.filter(email='test@example.com').first()
if not user:
    user = User.objects.create_user(
        email='test@example.com',
        password='testpass123'
    )

# Créer un client authentifié
client = Client()
client.force_login(user)

# Test simple
print('=== TEST SIMPLE ===')
try:
    response = client.post('/api/v1/payments/initiate/', {
        'order_id': '00000000-0000-0000-0000-000000000000',
        'provider': 'paydunya',
        'phone': '+221783326970'
    }, content_type='application/json')
    
    print(f'Status: {response.status_code}')
    print(f'Content: {response.content.decode()}')
    
except Exception as e:
    print(f'Exception: {e}')
    import traceback
    traceback.print_exc()
