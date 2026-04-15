import { useEffect, useMemo, useState } from 'react';
import { getAdminPaymentsApi, type AdminPayment } from '@/utils/api';
import { toast } from 'sonner';
import AsyncState from '@/components/ui/async-state';

export default function PaymentsAdmin() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminPaymentsApi()
      .then(setItems)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Erreur chargement paiements';
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const providers = useMemo(() => ['ALL', ...Array.from(new Set(items.map((i) => i.provider)))], [items]);
  const filtered = useMemo(() => provider === 'ALL' ? items : items.filter((i) => i.provider === provider), [items, provider]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-x-auto">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-heading font-semibold">Historique des paiements</h2>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="px-2 py-1 rounded border border-input bg-background text-sm">
          {providers.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {loading || error || filtered.length === 0 ? (
        <AsyncState
          loading={loading}
          error={error}
          isEmpty={!loading && !error && filtered.length === 0}
          emptyMessage="Aucun paiement trouve pour ce filtre."
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2">Référence</th>
              <th className="py-2">Provider</th>
              <th className="py-2">Montant</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                <td className="py-2">{item.provider_reference || '-'}</td>
                <td className="py-2">{item.provider}</td>
                <td className="py-2">{item.amount.toLocaleString('fr-FR')} FCFA</td>
                <td className="py-2">{item.status}</td>
                <td className="py-2">{new Date(item.created_at).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
