from urllib.parse import unquote, urlparse

from django.core.management.base import BaseCommand

from apps.annales.models import Annale


def normalize_pdf_key(value: str) -> str:
    raw = (value or "").strip()
    if not raw:
        return ""

    parsed = urlparse(raw)
    candidate = parsed.path if parsed.scheme else raw
    candidate = unquote(candidate).replace("\\", "/").lstrip("/")

    if candidate.startswith("media/"):
        candidate = candidate[len("media/") :]
    if candidate.startswith("annales/"):
        candidate = candidate[len("annales/") :]

    return candidate


class Command(BaseCommand):
    help = "Normalise les annales.pdf_key au format relatif (ex: pdfs/xxx.pdf)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Applique les modifications en base (sinon dry-run).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Nombre max d'annales à parcourir (0 = toutes).",
        )

    def handle(self, *args, **options):
        apply_changes = options["apply"]
        limit = max(options["limit"], 0)

        queryset = Annale.objects.exclude(pdf_key="").order_by("created_at")
        if limit:
            queryset = queryset[:limit]

        scanned = 0
        changed = 0

        for annale in queryset:
            scanned += 1
            old_value = annale.pdf_key
            new_value = normalize_pdf_key(old_value)

            if old_value == new_value:
                continue

            changed += 1
            self.stdout.write(
                f"- {annale.id}:\n"
                f"    old: {old_value}\n"
                f"    new: {new_value}"
            )

            if apply_changes:
                annale.pdf_key = new_value
                annale.save(update_fields=["pdf_key", "updated_at"])

        mode = "APPLY" if apply_changes else "DRY-RUN"
        self.stdout.write(self.style.SUCCESS(f"[{mode}] scanned={scanned}, changed={changed}"))
