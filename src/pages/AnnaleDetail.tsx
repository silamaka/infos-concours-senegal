import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Eye, Star, Download, FileText, Calendar, BookOpen, Share2 } from 'lucide-react';
import { Annale, getAnnaleByIdApi, getAnnalesApi } from '@/utils/api';
import { useCart } from '@/contexts/CartContext';
import BadgePopulaire from '@/components/BadgePopulaire';
import BadgeNouveau from '@/components/BadgeNouveau';
import ModalPDFPreview from '@/components/ModalPDFPreview';
import { toast } from 'sonner';

function isNotFoundMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('404') || normalized.includes('not found') || normalized.includes('introuvable');
}

export default function AnnaleDetail() {
  const { id } = useParams();
  const [annale, setAnnale] = useState<Annale | null>(null);
  const [relatedAnnales, setRelatedAnnales] = useState<Annale[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErrorMessage("Identifiant de l'annale manquant.");
      return;
    }
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        setLoading(true);
        setErrorMessage(null);
      }
      try {
        const detail = await getAnnaleByIdApi(id);
        const list = await getAnnalesApi();
        if (!mounted) return;
        setAnnale(detail);
        setRelatedAnnales(list.filter(a => a.id !== detail.id && a.category === detail.category).slice(0, 3));
      } catch (err) {
        if (!mounted) return;
        setAnnale(null);
        setRelatedAnnales([]);
        setErrorMessage(err instanceof Error ? err.message : "Chargement de l'annale impossible.");
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
        <p className="text-muted-foreground">Chargement de l'annale...</p>
      </div>
    );
  }

  if (!annale) {
    const isNotFound = isNotFoundMessage(errorMessage || '');
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">{isNotFound ? 'Annale introuvable.' : (errorMessage || "Chargement de l'annale impossible.")}</p>
        <Link to="/annales" className="text-primary text-sm hover:underline mt-4 inline-block">← Retour au catalogue</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({ id: annale.id, title: annale.title, price: annale.price, type: 'annale' });
    toast.success('Ajouté au panier !', { description: annale.title });
  };

  return (
    <div className="py-6 md:py-10 relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-15" aria-hidden="true" />
      <div className="container max-w-5xl">
        <Link to="/annales" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image + Badges */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
              <img src={annale.image} alt={annale.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                {annale.isPopular && <BadgePopulaire />}
                {annale.isNew && <BadgeNouveau />}
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {annale.category}
                </span>
                <h1 className="text-xl md:text-2xl font-heading font-bold text-white mt-2 leading-tight">{annale.title}</h1>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-secondary text-secondary" /> {annale.rating} <span className="text-xs">({annale.reviews} avis)</span></span>
              <span className="flex items-center gap-1.5"><Download className="h-4 w-4 text-primary" /> {annale.downloads?.toLocaleString('fr-FR')} téléchargements</span>
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> {annale.pages} pages</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> {annale.year}</span>
            </div>

            {/* Description */}
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 space-y-5 shadow-card">
              <div>
                <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">{annale.description}</p>
              </div>
              <div className="border-t border-border pt-5">
                <h2 className="text-lg font-heading font-semibold mb-3">Ce que contient cette annale</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Sujets officiels complets', 'Corrigés détaillés', 'Conseils méthodologiques', 'Barème de notation'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 space-y-5 sticky top-24 shadow-card">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-primary">{annale.price.toLocaleString('fr-FR')}</span>
                  <span className="text-sm text-muted-foreground">FCFA</span>
                </div>
                {annale.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">{annale.oldPrice.toLocaleString('fr-FR')} FCFA</span>
                )}
                {annale.oldPrice && (
                  <span className="ml-2 text-xs font-semibold text-accent">
                    -{Math.round(((annale.oldPrice - annale.price) / annale.oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span className="font-medium">{annale.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Pages</span>
                  <span className="font-medium">{annale.pages}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Année</span>
                  <span className="font-medium">{annale.year}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">PDF</span>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 gradient-hero text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="h-5 w-5" /> Ajouter au panier
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Eye className="h-4 w-4" /> Aperçu
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4" /> Partager
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedAnnales.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-heading font-bold mb-5">Annales similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedAnnales.map(a => (
                <Link
                  key={a.id}
                  to={`/annales/${a.id}`}
                  className="group bg-card/95 backdrop-blur-md border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-primary">{a.category}</span>
                    <h3 className="font-heading font-semibold text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                    <p className="text-sm font-bold text-primary mt-2">{a.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ModalPDFPreview open={showPreview} onClose={() => setShowPreview(false)} annale={annale} />
    </div>
  );
}
