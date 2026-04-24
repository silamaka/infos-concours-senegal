import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Download } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import BadgePopulaire from './BadgePopulaire';
import BadgeNouveau from './BadgeNouveau';

interface CardAnnaleProps {
  id: string | number;
  title: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  isPopular?: boolean;
  isNew?: boolean;
  year?: number;
  pages?: number;
  rating?: number;
  reviews?: number;
  downloads?: number;
  image?: string;
}

export default function CardAnnale({
  id, title, category, price, oldPrice, isPopular, isNew, year, pages, rating, reviews, downloads, image,
}: CardAnnaleProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(image) && !imageError;

  const handleAdd = () => {
    addItem({ id, title, price, type: 'annale' });
    toast.success('Ajouté au panier', { description: title });
  };

  return (
    <div className="group bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Cover image */}
      <Link to={`/annales/${id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted">
        {showImage ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">📄</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-background/80 border border-border rounded-full px-2 py-0.5">
              Image indisponible
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Badges overlay */}
        {(isNew || isPopular) && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {isNew && <BadgeNouveau />}
            {isPopular && <BadgePopulaire />}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category + Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {category}
          </span>
          {rating && reviews && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
              <span className="font-semibold text-foreground">{rating}</span>
              <span>({reviews})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link to={`/annales/${id}`}>
          <h3 className="font-heading font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        {/* Meta: pages · year · downloads */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          {pages && <span>{pages} pages</span>}
          {pages && year && <span>·</span>}
          {year && <span>{year}</span>}
          {downloads && (
            <>
              <span>·</span>
              <Download className="h-3 w-3" />
              <span>{downloads.toLocaleString('fr-FR')}</span>
            </>
          )}
        </div>

        {/* Price + Add button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {price.toLocaleString('fr-FR')} <span className="text-xs font-normal">F CFA</span>
            </span>
            {oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {oldPrice.toLocaleString('fr-FR')} F CFA
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 gradient-hero text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
            aria-label={`Ajouter ${title} au panier`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
