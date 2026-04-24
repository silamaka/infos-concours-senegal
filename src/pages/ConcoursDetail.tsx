import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, FileText, Clock, Star, Users, Share2, BookmarkPlus } from 'lucide-react';
import { Concours, getConcoursApi, getConcoursByIdApi } from '@/utils/api';
import { toast } from 'sonner';

function isNotFoundMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('404') || normalized.includes('not found') || normalized.includes('introuvable');
}

export default function ConcoursDetail() {
  const { id } = useParams();
  const [concours, setConcours] = useState<Concours | null>(null);
  const [relatedConcours, setRelatedConcours] = useState<Concours[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErrorMessage('Identifiant du concours manquant.');
      return;
    }
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        setLoading(true);
        setErrorMessage(null);
      }
      try {
        const detail = await getConcoursByIdApi(id);
        const list = await getConcoursApi();
        if (!mounted) return;
        setConcours(detail);
        setRelatedConcours(list.filter(c => c.id !== detail.id && c.category === detail.category).slice(0, 3));
      } catch (err) {
        if (!mounted) return;
        setConcours(null);
        setRelatedConcours([]);
        setErrorMessage(err instanceof Error ? err.message : 'Chargement du concours impossible.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Chargement du concours...</p>
      </div>
    );
  }

  if (!concours) {
    const isNotFound = isNotFoundMessage(errorMessage || '');
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">{isNotFound ? 'Concours introuvable.' : (errorMessage || 'Chargement du concours impossible.')}</p>
        <Link to="/concours" className="text-primary text-sm hover:underline mt-4 inline-block">← Retour aux concours</Link>
      </div>
    );
  }

  const statusColor = concours.status === 'Ouvert'
    ? 'bg-primary/10 text-primary border-primary/20'
    : concours.status === 'À venir'
      ? 'bg-secondary/10 text-secondary-foreground border-secondary/20'
      : 'bg-muted text-muted-foreground border-border';

  const handleRegisterClick = () => {
    const url = (concours.registration_url || '').trim();
    if (!url) {
      toast.error("Lien d'inscription indisponible pour ce concours.");
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-6 md:py-10">
      <div className="container max-w-5xl">
        {/* Breadcrumb */}
        <Link to="/concours" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour aux concours
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/8]">
              <img src={concours.image} alt={concours.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor}`}>
                    {concours.status}
                  </span>
                  <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {concours.category}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-heading font-bold text-white leading-tight">{concours.title}</h1>
              </div>
            </div>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-card border border-border rounded-xl p-4">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> {concours.date}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {concours.location}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent" /> Limite : {concours.deadline}</span>
              <span className="flex items-center gap-1.5 ml-auto"><Star className="h-4 w-4 fill-secondary text-secondary" /> {concours.rating} <span className="text-xs">({concours.reviews} avis)</span></span>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">{concours.description}</p>
              </div>
              <div className="border-t border-border pt-5">
                <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Pièces à Fournir
                </h2>
                <ul className="space-y-2">
                  {(concours.conditions || '').split('\n').filter(Boolean).map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                  {!(concours.conditions || '').trim() && (
                    <li className="text-muted-foreground text-sm">Aucune condition spécifique renseignée.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* CTA Card */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4 sticky top-24">
              <div className="text-center">
                <span className={`inline-flex text-sm font-semibold px-4 py-1.5 rounded-full border ${statusColor}`}>
                  {concours.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{concours.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Lieu</span>
                  <span className="font-medium">{concours.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Date limite</span>
                  <span className="font-medium text-accent">{concours.deadline}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span className="font-medium">{concours.category}</span>
                </div>
              </div>

              <button
                onClick={handleRegisterClick}
                className="w-full gradient-hero text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                S'inscrire au concours
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => toast.success('Concours sauvegardé !')}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <BookmarkPlus className="h-4 w-4" /> Sauvegarder
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4" /> Partager
                </button>
              </div>

              <Link
                to="/annales"
                className="block text-center border border-border py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                📚 Voir les annales associées
              </Link>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedConcours.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-heading font-bold mb-5">Concours similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedConcours.map(c => (
                <Link
                  key={c.id}
                  to={`/concours/${c.id}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-primary">{c.category}</span>
                    <h3 className="font-heading font-semibold text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
