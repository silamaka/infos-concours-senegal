import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Sparkles, BookOpen, Download, Tags } from 'lucide-react';
import CardAnnale from '@/components/CardAnnale';
import ModalPDFPreview from '@/components/ModalPDFPreview';
import { Annale, getAnnalesApi } from '@/utils/api';
import AsyncState from '@/components/ui/async-state';
import PageHero from '@/components/PageHero';

export default function CatalogAnnales() {
  const [annales, setAnnales] = useState<Annale[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'downloads'>('popular');
  const [previewAnnale, setPreviewAnnale] = useState<Annale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);


  useEffect(() => {
    let mounted = true;
    const loadAnnales = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnnalesApi();
        // Compatibilité pagination DRF
        if (mounted) setAnnales(Array.isArray(data) ? data : (data?.results || []));
      } catch (err: unknown) {
        if (mounted) setAnnales([]);
        if (mounted) setError(err instanceof Error ? err.message : 'Chargement des annales impossible.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAnnales();
    return () => {
      mounted = false;
    };
  }, [reloadTick]);

  const annaleCategories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(annales.map((annale) => annale.category)));
    return ['Tous', ...uniqueCategories];
  }, [annales]);

  const filtered = useMemo(() => {
    const result = annales.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Tous' || a.category === category;
      return matchSearch && matchCat;
    });

    if (sortBy === 'popular') {
      return [...result].sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === 'downloads') {
      return [...result].sort((a, b) => b.downloads - a.downloads);
    }

    return [...result].sort((a, b) => b.year - a.year);
  }, [annales, search, category, sortBy]);

  const popularCount = annales.filter((annale) => annale.isPopular).length;
  const totalDownloads = annales.reduce((sum, annale) => sum + (annale.downloads ?? 0), 0);

  return (
    <div className="py-8 md:py-12 relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-20" aria-hidden="true" />
      <div className="container">
        <div className="mb-8">
          <PageHero
            badge="Ressources premium"
            badgeIcon={Sparkles}
            title="Catalogue d'annales pour preparer efficacement vos concours"
            description="Retrouvez les annales les plus utiles, comparez les categories et accedez plus vite aux documents les plus telecharges de la plateforme."
            stats={[
              { label: 'annales', value: String(annales.length) },
              { label: 'categories', value: String(Math.max(annaleCategories.length - 1, 0)) },
              { label: 'telechargements', value: totalDownloads.toLocaleString('fr-FR') },
            ]}
          />
        </div>

        <div className="space-y-3 mb-8 bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                Collection
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{annales.length} annales consultables dans {Math.max(annaleCategories.length - 1, 0)} categories.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Download className="h-4 w-4 text-secondary" />
                Traction
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{totalDownloads.toLocaleString('fr-FR')} telechargements cumules et {popularCount} selections editoriales.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Tags className="h-4 w-4 text-accent" />
                Navigation
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Filtrez par categorie, popularite ou annee pour trouver vite la bonne ressource.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une annale..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'downloads')}
              className="h-11 rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Trier les annales"
            >
              <option value="popular">Plus populaires</option>
              <option value="recent">Plus recentes</option>
              <option value="downloads">Plus telechargees</option>
            </select>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
            {annaleCategories.map(cat => (
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

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} annale(s) affichee(s)</p>

        {loading || error || filtered.length === 0 ? (
          <AsyncState
            loading={loading}
            error={error}
            isEmpty={!loading && !error && filtered.length === 0}
            emptyMessage="Aucune annale trouvee. Essayez d'ajuster vos filtres."
            onRetry={() => setReloadTick((v) => v + 1)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map(a => (
              <CardAnnale key={a.id} {...a} />
            ))}
          </div>
        )}
      </div>

      <ModalPDFPreview
        open={!!previewAnnale}
        onClose={() => setPreviewAnnale(null)}
        annale={previewAnnale}
      />
    </div>
  );
}
