import os
from django.conf import settings
from apps.annales.models import Annale

def find_orphan_annale_pdfs():
    """
    Liste les fichiers PDF dans media/annales/ qui ne sont liés à aucune Annale.
    """
    annale_pdf_keys = set(Annale.objects.values_list("pdf_key", flat=True))
    annale_dir = os.path.join(settings.MEDIA_ROOT, "annales")
    if not os.path.isdir(annale_dir):
        print("Dossier annales/ introuvable.")
        return []
    orphans = []
    for fname in os.listdir(annale_dir):
        if fname.endswith(".pdf") and fname not in annale_pdf_keys:
            orphans.append(fname)
    return orphans

if __name__ == "__main__":
    orphans = find_orphan_annale_pdfs()
    if orphans:
        print("PDF orphelins :")
        for f in orphans:
            print(f" - {f}")
    else:
        print("Aucun PDF orphelin trouvé.")
