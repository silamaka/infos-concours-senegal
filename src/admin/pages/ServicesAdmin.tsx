import { useEffect, useMemo, useState } from 'react';
import { getAdminServicesApi, updateAdminServiceApi, type AdminServiceRequest } from '@/utils/api';
import { toast } from 'sonner';
import AsyncState from '@/components/ui/async-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Phone, Calendar, Target, Download, Paperclip, MessageCircle } from 'lucide-react';

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
              <th className="py-2">Date</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                <td className="py-2">
                  <div>
                    <div className="font-medium">{item.service_type}</div>
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </div>
                </td>
                <td className="py-2">
                  <div>
                    <div className="text-sm">{item.email}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {item.phone}
                    </div>
                  </div>
                </td>
                <td className="py-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className="py-2">
                  <select aria-label={`Changer statut de la demande ${item.id}`} value={item.status} onChange={(e) => setStatus(item, e.target.value as AdminServiceRequest['status'])} className="px-2 py-1 rounded border border-input bg-background text-xs">
                    <option value="submitted">Soumis</option>
                    <option value="in_progress">En cours</option>
                    <option value="delivered">Livré</option>
                  </select>
                </td>
                <td className="py-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Détails de la demande</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Type de service</label>
                            <p className="font-medium">{item.service_type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nom du client</label>
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="font-medium">{item.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{item.phone}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const cleanPhone = item.phone.replace(/[^\d]/g, '');
                                  const message = encodeURIComponent(`Bonjour ${item.name}, je vous contacte concernant votre demande de service "${item.service_type}".`);
                                  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                                }}
                                className="flex items-center gap-1 px-3 py-1 h-8 text-xs font-semibold bg-gradient-to-r from-green-400 to-green-500 border-green-400 text-white shadow-md hover:shadow-lg hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-200"
                              >
                                <MessageCircle className="h-3 w-3 fill-white" />
                                <span className="animate-pulse">💬</span>
                                WhatsApp
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Objectif/Cible</label>
                            <p className="font-medium">{item.target}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date de demande</label>
                            <p className="font-medium">{new Date(item.created_at).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Détails de la demande</label>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap text-sm">{item.details}</p>
                          </div>
                        </div>

                        {item.attachment_file_url && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Fichier joint</label>
                            <div className="mt-2 flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <Paperclip className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {item.attachment_file?.split('/').pop() || 'Fichier joint'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Cliquez pour télécharger ou ouvrir
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(item.attachment_file_url, '_blank')}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-3 w-3" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Statut actuel: <span className="font-medium">{item.status === 'submitted' ? 'Soumis' : item.status === 'in_progress' ? 'En cours' : 'Livré'}</span>
                          </div>
                          <div className="flex gap-2">
                            <select 
                              value={item.status} 
                              onChange={(e) => setStatus(item, e.target.value as AdminServiceRequest['status'])} 
                              className="px-3 py-2 rounded border border-input bg-background text-sm"
                            >
                              <option value="submitted">Soumis</option>
                              <option value="in_progress">En cours</option>
                              <option value="delivered">Livré</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
