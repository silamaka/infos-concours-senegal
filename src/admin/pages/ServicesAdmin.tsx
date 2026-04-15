import { useEffect, useMemo, useState } from 'react';
import { getAdminServicesApi, updateAdminServiceApi, type AdminServiceRequest } from '@/utils/api';
import { toast } from 'sonner';
import AsyncState from '@/components/ui/async-state';

export default function ServicesAdmin() {
  const [items, setItems] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | AdminServiceRequest['status']>('ALL');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await getAdminServicesApi();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erreur chargement services';
      setError(message);
      toast.error(message);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const source = filter === 'ALL' ? items : items.filter((i) => i.status === filter);
    const needle = query.toLowerCase();
    return source.filter((i) => i.name.toLowerCase().includes(needle) || i.email.toLowerCase().includes(needle) || i.service_type.toLowerCase().includes(needle));
  }, [items, filter, query]);

  const counters = useMemo(() => ({
    total: items.length,
    submitted: items.filter((s) => s.status === 'submitted').length,
    inProgress: items.filter((s) => s.status === 'in_progress').length,
    delivered: items.filter((s) => s.status === 'delivered').length,
  }), [items]);

  const setStatus = async (item: AdminServiceRequest, status: AdminServiceRequest['status']) => {
    try {
      await updateAdminServiceApi(item.id, status);
      toast.success('Statut de service mis à jour');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold text-xl">{counters.total}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Soumis</p><p className="font-semibold text-xl">{counters.submitted}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">En cours</p><p className="font-semibold text-xl">{counters.inProgress}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Livré</p><p className="font-semibold text-xl">{counters.delivered}</p></div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-x-auto">
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h2 className="font-heading font-semibold">Gestion des services</h2>
            <p className="text-xs text-muted-foreground">Suivi des demandes et progression du traitement.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher nom/email/service" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <select aria-label="Filtrer les demandes de services" value={filter} onChange={(e) => setFilter(e.target.value as 'ALL' | AdminServiceRequest['status'])} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="ALL">Tous</option>
              <option value="submitted">Soumis</option>
              <option value="in_progress">En cours</option>
              <option value="delivered">Livré</option>
            </select>
          </div>
        </div>
      {loading || error || filtered.length === 0 ? (
        <AsyncState
          loading={loading}
          error={error}
          isEmpty={!loading && !error && filtered.length === 0}
          emptyMessage="Aucune demande de service trouvee pour ces filtres."
          onRetry={() => {
            void load();
          }}
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2">Service</th>
              <th className="py-2">Contact</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                <td className="py-2">{item.service_type} - {item.name}</td>
                <td className="py-2">{item.email}</td>
                <td className="py-2">{item.status}</td>
                <td className="py-2">
                  <select aria-label={`Changer statut de la demande ${item.id}`} value={item.status} onChange={(e) => setStatus(item, e.target.value as AdminServiceRequest['status'])} className="px-2 py-1 rounded border border-input bg-background text-xs">
                    <option value="submitted">Soumis</option>
                    <option value="in_progress">En cours</option>
                    <option value="delivered">Livré</option>
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
