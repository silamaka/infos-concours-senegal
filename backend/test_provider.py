import os
from apps.payments.providers import get_payment_provider

print('Variables d\'environnement:')
print(f'PAYDUNYA_MASTER_KEY: {os.getenv("PAYDUNYA_MASTER_KEY", "NON DÉFINI")[:20]}...')
print(f'PAYDUNYA_PRIVATE_KEY: {os.getenv("PAYDUNYA_PRIVATE_KEY", "NON DÉFINI")[:20]}...')
print(f'PAYDUNYA_PUBLIC_KEY: {os.getenv("PAYDUNYA_PUBLIC_KEY", "NON DÉFINI")[:20]}...')
print(f'PAYDUNYA_TOKEN: {os.getenv("PAYDUNYA_TOKEN", "NON DÉFINI")[:20]}...')
print(f'PAYDUNYA_MODE: {os.getenv("PAYDUNYA_MODE", "NON DÉFINI")}')
print(f'PAYMENT_PROVIDER_MODE: {os.getenv("PAYMENT_PROVIDER_MODE", "NON DÉFINI")}')

try:
    # Test provider Paydunya
    provider = get_payment_provider('paydunya', 'live')
    print(f'Provider: {type(provider)}')
    
except Exception as e:
    print(f'❌ Erreur: {e}')
    import traceback
    traceback.print_exc()
