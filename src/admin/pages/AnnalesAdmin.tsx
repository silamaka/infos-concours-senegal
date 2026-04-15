import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus, Plus, Trash2, PencilLine } from 'lucide-react';
import {
  AdminAnnale,
  createAdminAnnaleApi,
  deleteAdminAnnaleApi,
  getAdminAnnalesApi,
  uploadAdminImageApi,
  uploadAdminPdfApi,
  updateAdminAnnaleApi,
} from '@/utils/api';
import { toast } from 'sonner';

const initialForm: Partial<AdminAnnale> = {
  title: '',
  category: '',
  price: undefined,
  oldPrice: null,
  isPopular: false,
  isNew: false,
  description: '',
  pages: 0,
  year: new Date().getFullYear(),
  image: '',
  preview_url: '',
  pdf_key: '',
};

export default function AnnalesAdmin() {
  const [items, setItems] = useState<AdminAnnale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminAnnale>>(initialForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const homeSelectedCount = items.filter((item) => !!item.isPopular).length;

  const imagePreview = form.image || form.preview_url || '';
  const isHttpUrl = (value?: string) => /^https?:\/\//i.test((value ?? '').trim());

  const load = async () => {
    const data = await getAdminAnnalesApi();
    setItems(data);
  };

  useEffect(() => {
    load().catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Erreur chargement annales'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedPrice = Number(form.price ?? 0);
    const normalizedOldPrice = form.oldPrice == null || form.oldPrice === 0 ? null : Number(form.oldPrice);

    if (!form.title?.trim() || !form.category?.trim()) {
      toast.error('Titre et catégorie sont obligatoires.');
      return;
    }
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      toast.error('Le prix doit être supérieur à 0.');
      return;
    }
    if (normalizedOldPrice !== null && normalizedOldPrice <= normalizedPrice) {
      toast.error('L\'ancien prix doit être supérieur au prix actuel.');
      return;
    }

    const payload: Partial<AdminAnnale> = {
      ...form,
      title: form.title?.trim(),
      category: form.category?.trim(),
      description: (form.description ?? '').trim(),
      image: (form.image ?? '').trim(),
      preview_url: (form.preview_url ?? '').trim(),
      pdf_key: (form.pdf_key ?? '').trim(),
      price: normalizedPrice,
      oldPrice: normalizedOldPrice,
      pages: Number(form.pages ?? 0),
      year: Number(form.year ?? new Date().getFullYear()),
    };

    try {
      if (editingId) {
        await updateAdminAnnaleApi(editingId, payload);
        toast.success('Annale mise à jour');
      } else {
        await createAdminAnnaleApi(payload);
        toast.success('Annale créée');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Opération impossible');
    }
  };

  const onEdit = (item: AdminAnnale) => {
    setEditingId(item.id);
    setForm({
      ...item,
      oldPrice: item.oldPrice ?? null,
      image: item.image ?? '',
      preview_url: item.preview_url ?? '',
      description: item.description ?? '',
      pages: item.pages ?? 0,
      year: item.year ?? new Date().getFullYear(),
      pdf_key: item.pdf_key ?? '',
    });
  };

  const pasteImageUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const value = text.trim();
      if (!value) {
        toast.error('Le presse-papiers est vide.');
        return;
      }
      setForm((prev) => ({ ...prev, image: value }));
      toast.success('URL image collée.');
    } catch {
      toast.error('Impossible de lire le presse-papiers.');
    }
  };

  const uploadLocalImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choisis un fichier image valide.');
      return;
    }

    try {
      setUploadingImage(true);
      const payload = await uploadAdminImageApi(file);
      setForm((prev) => ({ ...prev, image: payload.url }));
      toast.success('Image uploadée et liée à l\'annale.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload image impossible');
    } finally {
      setUploadingImage(false);
    }
  };

  const pastePdfUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const value = text.trim();
      if (!value) {
        toast.error('Le presse-papiers est vide.');
        return;
      }
      setForm((prev) => ({ ...prev, pdf_key: value }));
      toast.success('URL PDF collée.');
    } catch {
      toast.error('Impossible de lire le presse-papiers.');
    }
  };

  const uploadLocalPdf = async (file: File) => {
    const looksLikePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!looksLikePdf) {
      toast.error('Choisis un fichier PDF valide.');
      return;
    }

    try {
      setUploadingPdf(true);
      const payload = await uploadAdminPdfApi(file);
      setForm((prev) => ({
        ...prev,
        pdf_key: payload.url,
        preview_url: prev.preview_url || payload.url,
      }));
      toast.success('PDF uploadé et lié à l\'annale.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload PDF impossible');
    } finally {
      setUploadingPdf(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Confirmer la suppression de cette annale ?')) return;
    try {
      await deleteAdminAnnaleApi(id);
      toast.success('Annale supprimée');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const toggleHomeVisibility = async (item: AdminAnnale) => {
    const nextValue = !item.isPopular;

    if (nextValue && homeSelectedCount >= 4) {
      toast.error("Maximum 4 annales peuvent etre affichees sur la page d'accueil.");
      return;
    }

    try {
      await updateAdminAnnaleApi(item.id, { isPopular: nextValue });
      toast.success(nextValue ? "Annale ajoutee a l'accueil" : "Annale retiree de l'accueil");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Mise a jour impossible");
    }
  };

  const openPdfUrl = (value: string | undefined, label: string) => {
    const url = (value ?? '').trim();
    if (!url) {
      toast.error(`${label} est vide.`);
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error(`${label} doit commencer par http:// ou https://`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-primary" />
          <div>
            <h2 className="font-heading font-semibold">{editingId ? 'Modifier annale' : 'Ajouter annale'}</h2>
            <p className="text-xs text-muted-foreground">Complète d'abord les infos essentielles, puis ouvre les actions rapides si nécessaire.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Titre</label>
              <input value={form.title ?? ''} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Mathématiques Terminale S 2023" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Catégorie</label>
              <input value={form.category ?? ''} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Ex: BAC, BFEM, Concours" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Prix actuel (FCFA)</label>
              <input type="number" min={0} value={form.price ?? ''} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} placeholder="Ex: 2500" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ancien prix (optionnel)</label>
              <input type="number" min={0} value={form.oldPrice ?? ''} onChange={(e) => setForm((p) => ({ ...p, oldPrice: e.target.value ? Number(e.target.value) : null }))} placeholder="Ex: 3000" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Année</label>
              <input type="number" min={1990} max={2100} value={form.year ?? ''} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))} placeholder="Ex: 2025" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Nombre de pages</label>
              <input type="number" min={0} value={form.pages ?? ''} onChange={(e) => setForm((p) => ({ ...p, pages: Number(e.target.value) }))} placeholder="Ex: 48" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Description (optionnel)</label>
              <textarea value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Décris brièvement le contenu de l'annale" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm min-h-[80px]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center justify-between">URL aperçu PDF (optionnel) <span className={`text-[11px] ${isHttpUrl(form.preview_url) ? 'text-emerald-600' : 'text-muted-foreground'}`}>{isHttpUrl(form.preview_url) ? 'Valide' : 'http(s) attendu'}</span></label>
              <input value={form.preview_url ?? ''} onChange={(e) => setForm((p) => ({ ...p, preview_url: e.target.value }))} placeholder="https://..." className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, preview_url: p.pdf_key || '' }))}
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
                >
                  Utiliser URL PDF complet
                </button>
                <button
                  type="button"
                  onClick={() => openPdfUrl(form.preview_url, 'URL aperçu PDF')}
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
                >
                  Ouvrir aperçu
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center justify-between">Lien PDF complet / clé (optionnel) <span className={`text-[11px] ${isHttpUrl(form.pdf_key) ? 'text-emerald-600' : 'text-muted-foreground'}`}>{isHttpUrl(form.pdf_key) ? 'Valide' : 'http(s) attendu'}</span></label>
              <input value={form.pdf_key ?? ''} onChange={(e) => setForm((p) => ({ ...p, pdf_key: e.target.value }))} placeholder="https://... ou clé de stockage" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              <details className="mt-1">
                <summary className="text-xs text-muted-foreground cursor-pointer">Actions rapides PDF</summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="px-2 py-1 text-xs rounded border border-border hover:bg-muted cursor-pointer">
                    Choisir PDF local
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadLocalPdf(file);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </label>
                  <button type="button" onClick={pastePdfUrl} className="px-2 py-1 text-xs rounded border border-border hover:bg-muted">
                    Coller URL PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, pdf_key: p.preview_url || '' }))}
                    className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
                  >
                    Utiliser URL aperçu
                  </button>
                  <button
                    type="button"
                    onClick={() => openPdfUrl(form.pdf_key, 'Lien PDF complet')}
                    className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
                  >
                    Ouvrir PDF complet
                  </button>
                </div>
              </details>
              {uploadingPdf && <p className="mt-1 text-xs text-primary">Upload PDF en cours...</p>}
            </div>
            <div className="md:col-span-2 flex items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!form.isPopular} onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))} /> Afficher sur l'accueil</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!form.isNew} onChange={(e) => setForm((p) => ({ ...p, isNew: e.target.checked }))} /> Nouveau</label>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <ImagePlus className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Image de couverture</h3>
            </div>
            <label className="text-xs text-muted-foreground flex items-center justify-between">URL image <span className={`text-[11px] ${isHttpUrl(form.image) ? 'text-emerald-600' : 'text-muted-foreground'}`}>{isHttpUrl(form.image) ? 'Valide' : 'http(s) attendu'}</span></label>
            <input
              value={form.image ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              placeholder="https://..."
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer">Actions rapides image</summary>
              <div className="mt-2 flex gap-2 flex-wrap">
                <label className="px-2 py-1 text-xs rounded border border-border hover:bg-muted cursor-pointer">
                  Choisir image locale
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void uploadLocalImage(file);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </label>
                <button type="button" onClick={pasteImageUrl} className="px-2 py-1 text-xs rounded border border-border hover:bg-muted">
                  Coller URL image
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, image: p.preview_url || '' }))}
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
                >
                  Utiliser URL aperçu
                </button>
              </div>
            </details>
            {uploadingImage && <p className="mt-2 text-xs text-primary">Upload image en cours...</p>}

            <div className="mt-3 rounded-lg border border-border bg-background overflow-hidden h-44 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Aperçu couverture" className="h-full w-full object-cover" />
              ) : (
                <p className="text-xs text-muted-foreground px-3 text-center">Aperçu image ici après insertion de l'URL</p>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Astuce: colle directement le lien public de l'image pour l'enregistrer avec l'annale.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="gradient-hero text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold" type="submit">{editingId ? 'Enregistrer' : 'Créer'}</button>
          {editingId && (
            <button type="button" className="px-4 py-2 rounded-lg border border-border text-sm" onClick={() => { setEditingId(null); setForm(initialForm); }}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-x-auto">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="font-heading font-semibold">Liste des annales</h2>
          <p className="text-xs text-muted-foreground">
            Selection accueil: <span className="font-semibold text-foreground">{homeSelectedCount}/4</span>
          </p>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Chargement...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2">Image</th><th className="py-2">Titre</th><th className="py-2">Catégorie</th><th className="py-2">Prix</th><th className="py-2">Accueil</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                  <td className="py-2">
                    <div className="h-10 w-10 rounded-md overflow-hidden border border-border bg-background">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="py-2">{item.title}</td>
                  <td className="py-2">{item.category}</td>
                  <td className="py-2">{(item.price ?? 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => toggleHomeVisibility(item)}
                      className={`px-2 py-1 rounded border text-xs ${item.isPopular ? 'border-primary text-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
                    >
                      {item.isPopular ? 'Visible' : 'Masquee'}
                    </button>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button type="button" className="p-1.5 rounded border border-border" onClick={() => onEdit(item)}><PencilLine className="h-4 w-4" /></button>
                      <button type="button" className="p-1.5 rounded border border-border text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
