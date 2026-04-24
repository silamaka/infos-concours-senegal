import { useCallback, useEffect, useState } from 'react';
import { BarChart3, CreditCard, DollarSign, ShoppingBag, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { AdminAuditLog, AdminOverview, AdminStats, getAdminAuditLogsApi, getAdminOverviewApi, getAdminStatsApi } from '@/utils/api';

const currency = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

const getOrderStatusBadge = (status: string) => {
  const statusMap: {
    [key: string]: { label: string; color: string; bg: string; icon: React.ReactNode };
  } = {
    'completed': { label: 'Complétée', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 className="h-3 w-3" /> },
    'pending': { label: 'En attente', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Clock className="h-3 w-3" /> },
    'cancelled': { label: 'Annulée', color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle className="h-3 w-3" /> },
    'processing': { label: 'Traitement', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Clock className="h-3 w-3" /> },
  };
  return statusMap[status?.toLowerCase()] || { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: <AlertCircle className="h-3 w-3" /> };
};

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    const [statsPayload, overviewPayload] = await Promise.all([
      getAdminStatsApi(),
      getAdminOverviewApi(),
    ]);

    let auditPayload: AdminAuditLog[] = [];
    try {
      auditPayload = await getAdminAuditLogsApi();
    } catch {
      // Endpoint réservé aux admins : on garde le dashboard opérationnel pour le staff.
      auditPayload = [];
    }

    setStats(statsPayload);
    setOverview(overviewPayload);
    setAuditLogs(auditPayload.slice(0, 8));
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        await loadDashboard();
        if (!mounted) return;
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les statistiques.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    const intervalId = window.setInterval(() => {
      loadDashboard().catch(() => undefined);
    }, 60000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      await loadDashboard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de rafraichir les statistiques.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Chargement des statistiques...</p>;
  if (error) return <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{error}</div>;
  if (!stats) return null;

  const cards = [
    { label: 'Revenu total', value: currency(stats.total_revenue), icon: DollarSign },
    { label: 'Commandes', value: stats.orders_count.toLocaleString('fr-FR'), icon: ShoppingBag },
    { label: 'Utilisateurs', value: stats.users_count.toLocaleString('fr-FR'), icon: Users },
    { label: 'Annales vendues', value: stats.annales_sold.toLocaleString('fr-FR'), icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
    {/* Hero Header */}
    <section className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-primary/10 rounded-3xl p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité et des performances de votre plateforme</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void handleRefresh();
          }}
          disabled={refreshing}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-50"
        >
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
    </section>

    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((item) => (
        <article key={item.label} className="group relative bg-card border border-border rounded-3xl p-6 shadow-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted-foreground">{item.label}</p>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-heading font-bold tracking-tight">{item.value}</p>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mb-8" />
        </article>
      ))}
    </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
<div className="bg-card border border-border rounded-3xl p-6 shadow-card xl:col-span-2 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-lg flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-primary" />
              Commandes récentes
            </h2>
            <p className="text-xs text-muted-foreground">Dernières transactions de votre plateforme</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/50 bg-muted/30">
                <th className="py-3 px-4 font-semibold text-xs">Utilisateur</th>
                <th className="py-3 px-4 font-semibold text-xs">Statut</th>
                <th className="py-3 px-4 font-semibold text-xs">Total</th>
                <th className="py-3 px-4 font-semibold text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.recent_orders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-border/30 hover:bg-primary/3 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{order.user_email}</td>
                  <td className="py-3 px-4">
                    {(() => {
                      const badge = getOrderStatusBadge(order.status);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.color}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 font-semibold">{currency(order.total)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {(overview?.recent_orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag className="h-8 w-8 opacity-30" />
                      <span>Aucune commande pour le moment</span>
                    </div>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-card overflow-hidden">
          <div className="mb-6">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2 mb-1">
              <MessageSquare className="h-5 w-5 text-secondary" />
              Messages en attente
            </h2>
            <p className="text-xs text-muted-foreground">Demandes de contact non traitées</p>
          </div>
          <div className="space-y-3">
            {(overview?.recent_contacts ?? [])
              .filter((item) => !item.is_processed)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="group bg-muted/50 border border-border/50 rounded-2xl p-4 hover:border-secondary/30 hover:bg-secondary/5 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">{item.subject}</p>
                    <AlertCircle className="h-4 w-4 text-secondary/60 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.email}</p>
                </div>
              ))}
            {(overview?.recent_contacts ?? []).filter((item) => !item.is_processed).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-30 mb-2" />
                <span className="text-sm">Aucun message en attente</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-3xl p-6 shadow-card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-lg">Historique d'audit admin</h2>
            <p className="text-xs text-muted-foreground">Dernières actions sensibles exécutées dans l'espace d'administration</p>
          </div>
        </div>
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border px-3 py-2 text-sm bg-muted/20">
              <p className="font-medium text-foreground">{log.action}</p>
              <p className="text-xs text-muted-foreground">
                {log.admin_email || 'admin inconnu'} • {log.target_type} • {new Date(log.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune action d'audit enregistrée pour le moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
