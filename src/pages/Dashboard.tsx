import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Clock, CheckCircle, Wallet, PackageOpen, Sparkles, ArrowRight } from 'lucide-react';
import { getAnnaleDownloadApi, getMyOrdersApi, Order } from '@/utils/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? isoDate : parsed.toLocaleDateString('fr-FR');
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadOrders = async () => {
      try {
        const data = await getMyOrdersApi();
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (mounted) {
          setOrders([]);
          const message = err instanceof Error ? err.message : 'Impossible de charger vos commandes.';
          toast.error(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const paidOrders = useMemo(() => orders.filter(order => order.status === 'paid').length, [orders]);

  const handleDownload = async (annaleId: string) => {
    try {
      const payload = await getAnnaleDownloadApi(annaleId);
      
      // Crée un lien temporaire pour forcer le téléchargement
      const link = document.createElement('a');
      link.href = payload.url;
      link.download = `annale-${annaleId}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Téléchargement démarré.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Téléchargement impossible.';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-3xl">
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-4 w-4" /> Espace personnel
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Mon tableau de bord</h1>
          <p className="text-muted-foreground">Gérez vos commandes et téléchargez vos annales.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Commandes</p>
            <p className="text-2xl font-heading font-bold">{orders.length}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Payees</p>
            <p className="text-2xl font-heading font-bold text-primary">{paidOrders}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Statut compte</p>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Wallet className="h-4 w-4" /> Actif
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 shadow-card">
              <p className="text-sm text-muted-foreground mb-4">Aucune commande pour le moment.</p>
              <Link to="/annales" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Explorer les annales
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {orders.map(order => (
            <div key={order.id} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {formatDate(order.created_at)}
                </div>
                {order.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <CheckCircle className="h-4 w-4" /> Paye
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <PackageOpen className="h-4 w-4" /> En attente de paiement
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {(Array.isArray(order.items) ? order.items : []).map(item => (
                  <div key={`${order.id}-${item.annale_id}`} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-sm truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.quantity} x {item.price.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    {order.status === 'paid' ? (
                      <button
                        onClick={() => handleDownload(item.annale_id)}
                        className="flex items-center gap-1.5 gradient-hero text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Download className="h-4 w-4" /> Télécharger
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Indisponible</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border mt-4 pt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total commande</span>
                <span className="text-sm font-semibold">{order.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
