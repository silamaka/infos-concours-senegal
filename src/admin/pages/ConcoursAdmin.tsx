import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus, Plus, Trash2, PencilLine } from 'lucide-react';
import {
  AdminConcours,
  createAdminConcoursApi,
  deleteAdminConcoursApi,
  getAdminConcoursApi,
  uploadAdminImageApi,
  updateAdminConcoursApi,
} from '@/utils/api';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'open', label: 'Ouvert' },
  { value: 'closed', label: 'Fermé' },
];

function statusLabel(value?: string) {
  const found = statusOptions.find(opt => opt.value === value);
  return found ? found.label : value;
}

const initialForm: Partial<AdminConcours> = {
  title: '',
  category: '',
  date: '',
  registration_url: '',
  location: '',
  deadline: '',
  status: 'upcoming',
  description: '',
  is_featured: false,
  conditions: '',
};

export default function ConcoursAdmin() {
  const [items, setItems] = useState<AdminConcours[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminConcours>>(initialForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const homeSelectedCount = items.filter((item) => !!item.is_featured).length;

  const imagePreview = form.image || '';
  const isHttpUrl = (value?: string) => /^https?:\/\//i.test((value ?? '').trim());

  const load = async () => {
    const data = await getAdminConcoursApi();
    setItems(data);
  };

  useEffect(() => {
    load().catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Erreur chargement concours'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const title = (form.title ?? '').trim();
    const category = (form.category ?? '').trim();
    const location = (form.location ?? '').trim();
    const registrationUrl = (form.registration_url ?? '').trim();
    const status = (form.status ?? 'upcoming').trim().toLowerCase();
    const description = (form.description ?? '').trim();
    const date = form.date ?? '';
    const deadline = form.deadline ?? '';

    if (!title || !category || !date || !deadline || !location) {
      toast.error('Titre, catégorie, date, deadline et localisation sont obligatoires.');
      return;
    }
    if (new Date(deadline) > new Date(date)) {
      toast.error('La deadline ne peut pas être après la date du concours.');
      return;
    }
    if (registrationUrl && !/^https?:\/\//i.test(registrationUrl)) {
      toast.error("Le lien d'inscription doit commencer par http:// ou https://");
      return;
    }

    const payload: Partial<AdminConcours> = {
      ...form,
      title,
      category,
      date,
      deadline,
      location,
      status,
      description,
      registration_url: registrationUrl,
      image: (form.image ?? '').trim(),
      is_featured: !!form.is_featured,
      conditions: typeof form.conditions === 'string' ? form.conditions : '',
    };

    try {
      let concoursResult: AdminConcours | undefined;
      if (editingId) {
        concoursResult = await updateAdminConcoursApi(editingId, payload);
        toast.success('Concours mis à jour');
      } else {
        concoursResult = await createAdminConcoursApi(payload);
        toast.success('Concours créé');
      }
      if (!concoursResult) {
        toast.error("Erreur API admin : réponse inattendue. Vérifiez l’authentification et le backend.");
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Opération impossible');
    }
  };

  const onEdit = (item: AdminConcours) => {
    setEditingId(item.id);
    setForm({
      ...item,
      image: item.image ?? '',
      description: item.description ?? '',
      registration_url: item.registration_url ?? '',
      status: item.status ?? 'upcoming',
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
      toast.success('Image uploadée pour le concours.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload image impossible');
    } finally {
      setUploadingImage(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Confirmer la suppression de ce concours ?')) return;
    try {
      await deleteAdminConcoursApi(id);
      toast.success('Concours supprimé');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const toggleHomeVisibility = async (item: AdminConcours) => {
    const nextValue = !item.is_featured;

    if (nextValue && homeSelectedCount >= 3) {
      toast.error("Maximum 3 concours peuvent etre affiches sur la page d'accueil.");
      return;
    }

    try {
      await updateAdminConcoursApi(item.id, { is_featured: nextValue });
      toast.success(nextValue ? "Concours ajoute a l'accueil" : "Concours retire de l'accueil");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise a jour impossible');
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-primary" />
          <div>
            <h2 className="font-heading font-semibold">{editingId ? 'Modifier concours' : 'Ajouter concours'}</h2>
            <p className="text-xs text-muted-foreground">Crée rapidement un concours avec une structure claire et des médias centralisés.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl border border-border bg-background/60 p-4">
            <h3 className="text-sm font-semibold mb-3">Informations du concours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
              <label className="text-xs text-muted-foreground">Titre</label>
              <input value={form.title ?? ''} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Concours ENA 2026" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Catégorie</label>
              <input value={form.category ?? ''} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Ex: Administration, Santé, Enseignement" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Date du concours</label>
              <input type="date" value={form.date ?? ''} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Deadline</label>
              <input type="date" value={form.deadline ?? ''} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Localisation</label>
              <input value={form.location ?? ''} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Ex: Dakar" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required />
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Lien d'inscription</label>
              <input value={form.registration_url ?? ''} onChange={(e) => setForm((p) => ({ ...p, registration_url: e.target.value }))} placeholder="https://site-concours.sn/inscription" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Statut</label>
              <select value={form.status ?? 'upcoming'} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" required>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              </div>
              <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <textarea value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description courte du concours" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm min-h-[80px]" />
              </div>
              <div className="md:col-span-2 flex items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} /> Afficher sur l'accueil</label>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Pièces à Fournir <span className="text-muted-foreground text-[11px]">(une par ligne)</span></label>
                <textarea
                  value={form.conditions ?? ''}
                  onChange={e => setForm((p) => ({ ...p, conditions: e.target.value }))}
                  placeholder="Ex: Carte d'identité\nDossier complet\nPhoto d'identité"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <ImagePlus className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Image concours</h3>
            </div>
            <label className="text-xs text-muted-foreground flex items-center justify-between">URL image <span className={`text-[11px] ${isHttpUrl(form.image) ? 'text-emerald-600' : 'text-muted-foreground'}`}>{isHttpUrl(form.image) ? 'Lien valide' : 'Ajoute un lien http(s)'}</span></label>
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
              </div>
            </details>
            {uploadingImage && <p className="mt-2 text-xs text-primary">Upload image en cours...</p>}

            <div className="mt-3 rounded-lg border border-border bg-background overflow-hidden h-44 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Aperçu concours" className="h-full w-full object-cover" />
              ) : (
                <p className="text-xs text-muted-foreground px-3 text-center">Aperçu image ici après insertion</p>
              )}
            </div>
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
          <h2 className="font-heading font-semibold">Liste des concours</h2>
          <p className="text-xs text-muted-foreground">
            Selection accueil: <span className="font-semibold text-foreground">{homeSelectedCount}/3</span>
          </p>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Chargement...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2">Image</th><th className="py-2">Titre</th><th className="py-2">Catégorie</th><th className="py-2">Date</th><th className="py-2">Statut</th><th className="py-2">Conditions</th><th className="py-2">Accueil</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                  <td className="py-2">
                    <div className="h-10 w-10 rounded-md overflow-hidden border border-border bg-background">
                      {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : null}
                    </div>
                  </td>
                  <td className="py-2">{item.title}</td>
                  <td className="py-2">{item.category}</td>
                  <td className="py-2">{item.date}</td>
                  <td className="py-2">{statusLabel(item.status)}</td>
                  <td className="py-2 max-w-xs truncate" title={item.conditions || ''}>{(item.conditions || '').split('\n').filter(Boolean).slice(0,3).join(' | ') || <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => toggleHomeVisibility(item)}
                      className={`px-2 py-1 rounded border text-xs ${item.is_featured ? 'border-primary text-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
                    >
                      {item.is_featured ? 'Visible' : 'Masque'}
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
