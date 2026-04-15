import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Users, ListFilter, Sparkles, CalendarClock, MapPinned } from 'lucide-react';
import CardConcours from '@/components/CardConcours';
import { Concours, getConcoursApi } from '@/utils/api';
import AsyncState from '@/components/ui/async-state';
import PageHero from '@/components/PageHero';

export default function ConcoursList() {
  const [concours, setConcours] = useState<Concours[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState<'popular' | 'deadline' | 'recent'>('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadConcours = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getConcoursApi();
        if (mounted) setConcours(data);
      } catch (err: unknown) {
        if (mounted) setConcours([]);
        if (mounted) setError(err instanceof Error ? err.message : 'Chargement des concours impossible.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadConcours();
    return () => {
      mounted = false;
    };
  }, [reloadTick]);

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(concours.map((item) => item.category)));
    return ['Tous', ...dynamic];
  }, [concours]);

  const filtered = useMemo(() => {
    const result = concours.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Tous' || c.category === category;
      return matchSearch && matchCat;
    });

    if (sortBy === 'popular') {
      return [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    if (sortBy === 'deadline') {
      return [...result].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }

    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [concours, search, category, sortBy]);

  const openCount = concours.filter(c => c.status === 'Ouvert').length;
  const categoriesCount = Math.max(categories.length - 1, 0);
  const urgentCount = concours.filter((c) => {
    const deadline = new Date(c.deadline).getTime();
    const diffDays = (deadline - Date.now()) / (1000 * 60 * 60 * 24);
    return Number.isFinite(diffDays) && diffDays >= 0 && diffDays <= 14;
  }).length;

  return (
    <div className="py-8 md:py-12 relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-20" aria-hidden="true" />
      <div className="container">
        <div className="mb-8">
          <PageHero
            badge="Opportunites selectionnees"
            badgeIcon={Sparkles}
            title="Concours et opportunites a suivre"
            description="Reperez rapidement les concours ouverts, comparez les echeances et concentrez-vous sur les opportunites qui correspondent vraiment a votre parcours."
            stats={[
              { label: 'ouverts', value: String(openCount) },
              { label: 'categories', value: String(categoriesCount) },
              { label: 'urgents', value: String(urgentCount) },
            ]}
          />
        </div>

        <div className="space-y-4 mb-8 bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Volume actif
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{openCount} concours ouverts sur {concours.length} references disponibles.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarClock className="h-4 w-4 text-secondary" />
                Dates limites
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{urgentCount} opportunites ferment dans les 14 prochains jours.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPinned className="h-4 w-4 text-accent" />
                Parcours rapide
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Combinez recherche, tri et categories pour identifier votre prochaine candidature en quelques clics.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un concours, une institution..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'deadline' | 'recent')}
                className="h-12 rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Trier les concours"
              >
                <option value="popular">Plus populaires</option>
                <option value="deadline">Date limite proche</option>
                <option value="recent">Plus recents</option>
              </select>

              <button
                type="button"
                aria-label="Options de filtres"
                className="h-12 w-12 rounded-2xl border border-input bg-card inline-flex items-center justify-center text-muted-foreground"
              >
                <ListFilter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  category === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-input hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} resultat(s) affiches</p>

        {/* Results Grid */}
        {loading || error || filtered.length === 0 ? (
          <AsyncState
            loading={loading}
            error={error}
            isEmpty={!loading && !error && filtered.length === 0}
            emptyMessage="Aucun concours trouve. Essayez de modifier vos filtres."
            onRetry={() => setReloadTick((v) => v + 1)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <CardConcours key={c.id} {...c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
