from apps.concours.models import Concours

def run():
    count = Concours.objects.filter(status__iexact='open').update(status='Ouvert')
    count += Concours.objects.filter(status__iexact='ouvert').exclude(status='Ouvert').update(status='Ouvert')
    print(f"{count} concours mis à jour en 'Ouvert'.")
