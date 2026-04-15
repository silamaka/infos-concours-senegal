from datetime import date

from django.core.management.base import BaseCommand

from apps.annales.models import Annale
from apps.concours.models import Concours


ANNALES_DATA = [
    {
        "title": "Annale Concours Gendarmerie 2025",
        "category": "Securite",
        "price": 3500,
        "old_price": 5000,
        "is_popular": True,
        "is_new": True,
        "description": "Sujets officiels et corriges detailles du concours Gendarmerie.",
        "pages": 120,
        "year": 2025,
        "rating": 4.8,
        "reviews": 312,
        "downloads": 2400,
        "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800",
        "preview_url": "https://example.com/previews/gendarmerie-2025.pdf",
    },
    {
        "title": "Guide Police Nationale 2025",
        "category": "Securite",
        "price": 4500,
        "old_price": None,
        "is_popular": True,
        "is_new": False,
        "description": "Recueil complet des epreuves Police Nationale 2025.",
        "pages": 95,
        "year": 2025,
        "rating": 4.6,
        "reviews": 198,
        "downloads": 1820,
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        "preview_url": "https://example.com/previews/police-2025.pdf",
    },
    {
        "title": "Annale ENA Cycle A 2024",
        "category": "Administration",
        "price": 3500,
        "old_price": None,
        "is_popular": False,
        "is_new": True,
        "description": "Annale ENA Cycle A avec corriges et conseils methodologiques.",
        "pages": 60,
        "year": 2024,
        "rating": 4.3,
        "reviews": 87,
        "downloads": 640,
        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
        "preview_url": "https://example.com/previews/ena-cycle-a-2024.pdf",
    },
    {
        "title": "Recueil Douanes Senegalaises 2025",
        "category": "Finance",
        "price": 4000,
        "old_price": 5500,
        "is_popular": False,
        "is_new": True,
        "description": "Epreuves corrigees pour concours des Douanes.",
        "pages": 108,
        "year": 2025,
        "rating": 4.5,
        "reviews": 87,
        "downloads": 980,
        "image": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
        "preview_url": "https://example.com/previews/douanes-2025.pdf",
    },
    {
        "title": "Pack Reussite Securite 2025",
        "category": "Securite",
        "price": 6500,
        "old_price": 9000,
        "is_popular": True,
        "is_new": True,
        "description": "Pack complet Gendarmerie + Police + Douanes.",
        "pages": 280,
        "year": 2025,
        "rating": 4.9,
        "reviews": 425,
        "downloads": 3200,
        "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
        "preview_url": "https://example.com/previews/pack-securite-2025.pdf",
    },
]

CONCOURS_DATA = [
    {
        "title": "Concours Gendarmerie Nationale 2026",
        "category": "Securite",
        "date": date(2026, 5, 15),
        "description": "Recrutement de gendarmes auxiliaires.",
        "location": "Dakar",
        "deadline": date(2026, 4, 30),
        "status": "Ouvert",
        "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
        "rating": 4.8,
        "reviews": 245,
        "is_featured": True,
    },
    {
        "title": "Concours Police Nationale 2026",
        "category": "Securite",
        "date": date(2026, 6, 1),
        "description": "Recrutement d'officiers de police.",
        "location": "Tout le Senegal",
        "deadline": date(2026, 5, 15),
        "status": "Ouvert",
        "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800",
        "rating": 4.6,
        "reviews": 198,
        "is_featured": True,
    },
    {
        "title": "Concours ENA 2026",
        "category": "Administration",
        "date": date(2026, 7, 10),
        "description": "Cycle A et B de l'Ecole Nationale d'Administration.",
        "location": "Dakar",
        "deadline": date(2026, 6, 20),
        "status": "A venir",
        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
        "rating": 4.5,
        "reviews": 132,
        "is_featured": False,
    },
    {
        "title": "Concours Douanes 2026",
        "category": "Finance",
        "date": date(2026, 6, 20),
        "description": "Recrutement d'agents des douanes.",
        "location": "Dakar",
        "deadline": date(2026, 5, 30),
        "status": "Ouvert",
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        "rating": 4.3,
        "reviews": 87,
        "is_featured": False,
    },
    {
        "title": "Concours Eaux et Forets 2026",
        "category": "Environnement",
        "date": date(2026, 8, 1),
        "description": "Recrutement d'agents des eaux et forets.",
        "location": "Ziguinchor",
        "deadline": date(2026, 7, 10),
        "status": "A venir",
        "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        "rating": 4.1,
        "reviews": 56,
        "is_featured": False,
    },
]


class Command(BaseCommand):
    help = "Seed demo data for annales and concours."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing Annale and Concours data before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            Annale.objects.all().delete()
            Concours.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing Annale and Concours data deleted."))

        annales_created = 0
        annales_updated = 0
        for payload in ANNALES_DATA:
            obj, created = Annale.objects.update_or_create(
                title=payload["title"],
                defaults=payload,
            )
            if created:
                annales_created += 1
            else:
                annales_updated += 1

        concours_created = 0
        concours_updated = 0
        for payload in CONCOURS_DATA:
            obj, created = Concours.objects.update_or_create(
                title=payload["title"],
                defaults=payload,
            )
            if created:
                concours_created += 1
            else:
                concours_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete. Annales: +{annales_created} created, {annales_updated} updated. "
                f"Concours: +{concours_created} created, {concours_updated} updated."
            )
        )
