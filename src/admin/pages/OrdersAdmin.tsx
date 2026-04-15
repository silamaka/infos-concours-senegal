import { useEffect, useMemo, useState } from 'react';
import { getAdminOrdersApi, updateAdminOrderApi, type AdminOrder } from '@/utils/api';
import { toast } from 'sonner';
import AsyncState from '@/components/ui/async-state';

const statuses: AdminOrder['status'][] = ['pending', 'paid', 'failed'];

export default function OrdersAdmin() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AdminOrder['status']>('ALL');

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await getAdminOrdersApi();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erreur chargement commandes';
      setError(message);
      toast.error(message);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => items.filter((o) => {
    const needle = query.toLowerCase();
    const statusOk = statusFilter === 'ALL' || o.status === statusFilter;
    if (!statusOk) return false;
    return o.user_email.toLowerCase().includes(needle) || o.status.toLowerCase().includes(needle);
  }), [items, query, statusFilter]);

  const counters = useMemo(() => ({
    total: items.length,
    pending: items.filter((o) => o.status === 'pending').length,
    paid: items.filter((o) => o.status === 'paid').length,
    failed: items.filter((o) => o.status === 'failed').length,
  }), [items]);

  const statusBadge = (status: AdminOrder['status']) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'failed') return 'bg-rose-100 text-rose-700';
    return 'bg-amber-100 text-amber-700';
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await updateAdminOrderApi(id, status as AdminOrder['status']);
      toast.success('Statut mis à jour');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold text-xl">{counters.total}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Pending</p><p className="font-semibold text-xl">{counters.pending}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Paid</p><p className="font-semibold text-xl">{counters.paid}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Failed</p><p className="font-semibold text-xl">{counters.failed}</p></div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-x-auto">
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h2 className="font-heading font-semibold">Gestion des commandes</h2>
            <p className="text-xs text-muted-foreground">Suivi rapide des statuts et mise à jour instantanée.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher email/statut" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <select aria-label="Filtrer les commandes par statut" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'ALL' | AdminOrder['status'])} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="ALL">Tous statuts</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
      {loading || error || filtered.length === 0 ? (
        <AsyncState
          loading={loading}
          error={error}
          isEmpty={!loading && !error && filtered.length === 0}
          emptyMessage="Aucune commande trouvee pour ces filtres."
          onRetry={() => {
            void load();
          }}
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2">Utilisateur</th>
              <th className="py-2">Total</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Date</th>
              <th className="py-2">Changer statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                <td className="py-2">{item.user_email}</td>
                <td className="py-2">{item.total.toLocaleString('fr-FR')} FCFA</td>
                <td className="py-2"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(item.status)}`}>{item.status}</span></td>
                <td className="py-2">{new Date(item.created_at).toLocaleString('fr-FR')}</td>
                <td className="py-2">
                  <select
                    aria-label={`Changer statut de la commande ${item.id}`}
                    value={item.status}
                    onChange={(e) => changeStatus(item.id, e.target.value)}
                    className="px-2 py-1 rounded border border-input bg-background"
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
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
