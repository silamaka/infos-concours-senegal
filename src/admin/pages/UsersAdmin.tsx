import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  createAdminUserApi,
  deleteAdminUserApi,
  getAdminUsersApi,
  updateAdminUserApi,
  type AdminUserCreatePayload,
  type AdminUserRow,
} from '@/utils/api';
import { toast } from 'sonner';
import AsyncState from '@/components/ui/async-state';

const roles: AdminUserRow['role'][] = ['USER', 'STAFF', 'ADMIN'];

const initialNewUser: AdminUserCreatePayload = {
  email: '',
  first_name: '',
  last_name: '',
  role: 'USER',
  password: '',
  is_active: true,
};

export default function UsersAdmin() {
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRow['role'] | 'ALL'>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'true' | 'false'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [ordering, setOrdering] = useState<'-date_joined' | 'date_joined' | 'email' | '-email'>('-date_joined');
  const [newUser, setNewUser] = useState<AdminUserCreatePayload>(initialNewUser);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await getAdminUsersApi({
      role: roleFilter,
      is_active: activeFilter,
      search: query,
      page,
      page_size: pageSize,
      ordering,
    });
    setItems(data.results);
    setTotalCount(data.count);
    setLoading(false);
  }, [activeFilter, ordering, page, pageSize, query, roleFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchInput.trim());
    }, 350);
    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, activeFilter, pageSize, ordering]);

  useEffect(() => {
    load().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erreur chargement utilisateurs';
      setError(message);
      toast.error(message);
      setLoading(false);
    });
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const counters = useMemo(() => ({
    all: items.length,
    admins: items.filter((u) => u.role === 'ADMIN').length,
    staff: items.filter((u) => u.role === 'STAFF').length,
    active: items.filter((u) => u.is_active).length,
  }), [items]);

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUser.email.trim() || !newUser.first_name.trim() || !newUser.last_name.trim() || !newUser.password.trim()) {
      toast.error('Tous les champs du formulaire de création sont requis.');
      return;
    }
    if (newUser.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      await createAdminUserApi({
        ...newUser,
        email: newUser.email.trim().toLowerCase(),
        first_name: newUser.first_name.trim(),
        last_name: newUser.last_name.trim(),
      });
      toast.success('Utilisateur créé');
      setNewUser(initialNewUser);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Création impossible');
    }
  };

  const updateRole = async (id: string, role: AdminUserRow['role']) => {
    try {
      await updateAdminUserApi(id, { role });
      toast.success('Role mis à jour');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  const toggleActive = async (item: AdminUserRow) => {
    try {
      await updateAdminUserApi(item.id, { is_active: !item.is_active });
      toast.success('Statut utilisateur mis à jour');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  const updateName = async (item: AdminUserRow, firstName: string, lastName: string) => {
    try {
      await updateAdminUserApi(item.id, { first_name: firstName.trim(), last_name: lastName.trim() });
      toast.success('Nom mis à jour');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  const resetPassword = async (item: AdminUserRow) => {
    const password = window.prompt(`Nouveau mot de passe pour ${item.email} (min 8 caractères):`);
    if (!password) return;
    if (password.length < 8) {
      toast.error('Mot de passe trop court (min 8 caractères).');
      return;
    }
    try {
      await updateAdminUserApi(item.id, { password });
      toast.success('Mot de passe réinitialisé');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Réinitialisation impossible');
    }
  };

  const removeUser = async (item: AdminUserRow) => {
    if (!window.confirm(`Supprimer l'utilisateur ${item.email} ?`)) return;
    try {
      await deleteAdminUserApi(item.id);
      toast.success('Utilisateur supprimé');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={createUser} className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-primary" />
          <div>
            <h2 className="font-heading font-semibold">Créer un utilisateur</h2>
            <p className="text-xs text-muted-foreground">Provisionne un compte en quelques secondes avec rôle et statut initial.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={newUser.first_name} onChange={(e) => setNewUser((p) => ({ ...p, first_name: e.target.value }))} placeholder="Prénom" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input value={newUser.last_name} onChange={(e) => setNewUser((p) => ({ ...p, last_name: e.target.value }))} placeholder="Nom" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} placeholder="Mot de passe" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as AdminUserRow['role'] }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!newUser.is_active} onChange={(e) => setNewUser((p) => ({ ...p, is_active: e.target.checked }))} />
            Actif dès la création
          </label>
          <button className="gradient-hero text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold" type="submit">
            Créer l'utilisateur
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold text-xl">{totalCount}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Admins</p><p className="font-semibold text-xl">{counters.admins}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Staff</p><p className="font-semibold text-xl">{counters.staff}</p></div>
        <div className="bg-card border border-border rounded-xl p-3"><p className="text-xs text-muted-foreground">Actifs</p><p className="font-semibold text-xl">{counters.active}</p></div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-x-auto">
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h2 className="font-heading font-semibold">Gestion des utilisateurs</h2>
            <p className="text-xs text-muted-foreground">Filtre, modifie les rôles et gère la sécurité des comptes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Rechercher utilisateur" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <select aria-label="Filtrer utilisateurs par role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as AdminUserRow['role'] | 'ALL')} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="ALL">Tous les rôles</option>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select aria-label="Filtrer utilisateurs par statut actif" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as 'ALL' | 'true' | 'false')} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="ALL">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
            <select aria-label="Trier utilisateurs" value={ordering} onChange={(e) => setOrdering(e.target.value as '-date_joined' | 'date_joined' | 'email' | '-email')} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="-date_joined">Inscription récente</option>
              <option value="date_joined">Inscription ancienne</option>
              <option value="email">Email A-Z</option>
              <option value="-email">Email Z-A</option>
            </select>
            <select aria-label="Taille de page utilisateurs" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
        {loading || error || items.length === 0 ? (
          <AsyncState
            loading={loading}
            error={error}
            isEmpty={!loading && !error && items.length === 0}
            emptyMessage="Aucun utilisateur trouve pour ces filtres."
            onRetry={() => {
              void load();
            }}
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Email</th>
                  <th className="py-2">Nom</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Actif</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className={`${idx % 2 ? 'bg-muted/20' : ''} hover:bg-muted/40`}>
                    <td className="py-2">{item.email}</td>
                    <td className="py-2">{item.first_name} {item.last_name}</td>
                    <td className="py-2">
                      <select aria-label={`Changer role de ${item.email}`} value={item.role} onChange={(e) => updateRole(item.id, e.target.value as AdminUserRow['role'])} className="px-2 py-1 rounded border border-input bg-background">
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="py-2">
                      <button type="button" aria-label={`${item.is_active ? 'Desactiver' : 'Activer'} le compte ${item.email}`} onClick={() => toggleActive(item)} className="px-3 py-1 rounded border border-border text-xs">
                        {item.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                    <td className="py-2">
                      <details>
                        <summary className="text-xs text-muted-foreground cursor-pointer">Actions avancées</summary>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <button onClick={() => {
                            const first = window.prompt('Prénom', item.first_name) ?? item.first_name;
                            const last = window.prompt('Nom', item.last_name) ?? item.last_name;
                            void updateName(item, first, last);
                          }} className="px-2 py-1 rounded border border-border text-xs">
                            Modifier nom
                          </button>
                          <button onClick={() => resetPassword(item)} className="px-2 py-1 rounded border border-border text-xs">
                            Reset mot de passe
                          </button>
                          <button onClick={() => removeUser(item)} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                          </button>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Page {page} / {totalPages} • {totalCount} utilisateurs
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded border border-border text-xs disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded border border-border text-xs disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
