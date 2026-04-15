import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Mail, Trash2 } from 'lucide-react';
import { deleteAdminContactApi, getAdminContactApi, updateAdminContactApi, type AdminContactMessage } from '@/utils/api';
import { toast } from 'sonner';
import AsyncState from '@/components/ui/async-state';

export default function ContactAdmin() {
  const [items, setItems] = useState<AdminContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'ALL' | 'OPEN' | 'PROCESSED'>('ALL');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const modeToApi = (value: 'ALL' | 'OPEN' | 'PROCESSED'): 'ALL' | 'true' | 'false' => {
    if (value === 'OPEN') return 'false';
    if (value === 'PROCESSED') return 'true';
    return 'ALL';
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await getAdminContactApi({
      is_processed: modeToApi(mode),
      search: query,
      page,
      page_size: pageSize,
    });
    const computedTotalPages = Math.max(1, Math.ceil(data.count / pageSize));
    if (page > computedTotalPages) {
      setPage(computedTotalPages);
      setLoading(false);
      return;
    }

    setItems(data.results);
    setTotalCount(data.count);
    setLoading(false);
  }, [mode, page, pageSize, query]);

  useEffect(() => {
    load().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erreur chargement contacts';
      toast.error(message);
      setError(message);
      setLoading(false);
    });
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [mode, query, pageSize]);

  useEffect(() => {
    if (!selectedId && items.length > 0) {
      setSelectedId(items[0].id);
      return;
    }
    if (selectedId && !items.some((i) => i.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const counters = useMemo(() => ({
    total: totalCount,
    open: items.filter((i) => !i.is_processed).length,
    processed: items.filter((i) => i.is_processed).length,
  }), [items, totalCount]);

  const toggleProcessed = async (item: AdminContactMessage) => {
    try {
      await updateAdminContactApi(item.id, { is_processed: !item.is_processed });
      toast.success('Statut du message mis à jour');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  const removeMessage = async (item: AdminContactMessage) => {
    if (!window.confirm(`Supprimer le message de ${item.email} ?`)) return;
    try {
      await deleteAdminContactApi(item.id);
      toast.success('Message supprimé');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const copyMessage = async (item: AdminContactMessage) => {
    const text = `From: ${item.name} <${item.email}>\nSubject: ${item.subject}\n\n${item.message}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Message copié dans le presse-papiers');
    } catch {
      toast.error('Impossible de copier le message');
    }
  };

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showState = loading || !!error || items.length === 0;
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const exportCsv = async () => {
    if (!totalCount) {
      toast.error('Aucun message a exporter');
      return;
    }

    let pageToFetch = 1;
    const allItems: AdminContactMessage[] = [];
    try {
      while (true) {
        const data = await getAdminContactApi({
          is_processed: modeToApi(mode),
          search: query,
          page: pageToFetch,
          page_size: 100,
        });
        allItems.push(...data.results);
        if (!data.next) break;
        pageToFetch += 1;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export impossible');
      return;
    }

    const quote = (value: string | boolean) => `"${String(value).replace(/"/g, '""')}"`;
    const header = ['id', 'name', 'email', 'subject', 'is_processed', 'created_at', 'message'];
    const rows = allItems.map((item) => [
      quote(item.id),
      quote(item.name),
      quote(item.email),
      quote(item.subject),
      quote(item.is_processed),
      quote(item.created_at),
      quote(item.message),
    ].join(','));

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Export CSV genere (${allItems.length} messages)`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-live="polite">
        <div className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground">Total (filtre)</p><p className="font-semibold text-2xl mt-1">{counters.total}</p></div>
        <div className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground">Non traités (page)</p><p className="font-semibold text-2xl mt-1">{counters.open}</p></div>
        <div className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground">Traités (page)</p><p className="font-semibold text-2xl mt-1">{counters.processed}</p></div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-x-auto">
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h2 className="font-heading font-semibold">Messages contact</h2>
            <p className="text-xs text-muted-foreground">Répondre, classifier, supprimer et exporter les messages depuis un seul tableau.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Rechercher email, sujet, contenu" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <select value={mode} onChange={(e) => setMode(e.target.value as 'ALL' | 'OPEN' | 'PROCESSED')} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="ALL">Tous</option>
              <option value="OPEN">Non traités</option>
              <option value="PROCESSED">Traités</option>
            </select>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" aria-label="Taille de page">
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <button onClick={exportCsv} type="button" className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
      {showState ? (
        <AsyncState
          loading={loading}
          error={error}
          isEmpty={!loading && !error && items.length === 0}
          emptyMessage="Aucun message trouve avec ces filtres."
          onRetry={() => {
            void load();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
          <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2">Nom</th>
              <th className="py-2">Email</th>
              <th className="py-2">Sujet</th>
              <th className="py-2">Message</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40 ${selectedId === item.id ? 'bg-primary/10' : ''}`}
              >
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(item.id);
                      }
                    }}
                    className="text-left hover:underline focus-visible:underline rounded-sm"
                    aria-label={`Voir les details du message de ${item.name}`}
                  >
                    {item.name}
                  </button>
                </td>
                <td className="py-2">{item.email}</td>
                <td className="py-2">{item.subject}</td>
                <td className="py-2 max-w-xs">
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground">Voir message</summary>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{item.message}</p>
                  </details>
                </td>
                <td className="py-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.is_processed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.is_processed ? 'Traité' : 'Non traité'}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => toggleProcessed(item)} className="px-2 py-1 rounded border border-border text-xs hover:bg-muted">
                      {item.is_processed ? 'Marquer non traité' : 'Marquer traité'}
                    </button>
                    <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs">
                      <Mail className="h-3.5 w-3.5" /> Répondre
                    </a>
                    <button type="button" onClick={() => copyMessage(item)} className="px-2 py-1 rounded border border-border text-xs hover:bg-muted">Copier</button>
                    <button type="button" onClick={() => removeMessage(item)} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <p>Page {page} / {totalPages} ({totalCount} messages)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} type="button" className="px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-50">Precedent</button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`px-2 py-1 rounded border ${p === page ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} type="button" className="px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-50">Suivant</button>
            </div>
          </div>
          </div>

          <aside className="border border-border rounded-xl p-4 bg-background/30">
            {selectedItem ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Expediteur</p>
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedItem.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sujet</p>
                  <p className="font-medium">{selectedItem.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{new Date(selectedItem.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedItem.message}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selectionnez un message pour voir les details.</p>
            )}
          </aside>
        </div>
      )}
      </div>
    </div>
  );
}
