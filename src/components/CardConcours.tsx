import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star } from 'lucide-react';

interface CardConcoursProps {
  id: string | number;
  title: string;
  category: string;
  date: string;
  description: string;
  location: string;
  deadline: string;
  status: string;
  image?: string;
  rating?: number;
  reviews?: number;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  open: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', label: 'Ouvert' },
  ouvert: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', label: 'Ouvert' },
  upcoming: { bg: 'bg-secondary/10', text: 'text-secondary', dot: 'bg-secondary', label: 'A venir' },
  'a venir': { bg: 'bg-secondary/10', text: 'text-secondary', dot: 'bg-secondary', label: 'A venir' },
  closed: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive', label: 'Ferme' },
  ferme: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive', label: 'Ferme' },
};

const normalizeStatus = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function CardConcours({
  id, title, category, description, location, date, deadline, status, image, rating, reviews,
}: CardConcoursProps) {
  const [imageError, setImageError] = useState(false);
  const statusKey = useMemo(() => normalizeStatus(status), [status]);
  const st = statusConfig[statusKey] || statusConfig.open;
  const showImage = Boolean(image) && !imageError;

  return (
    <Link
      to={`/concours/${id}`}
      className="group bg-white/90 backdrop-blur-lg rounded-3xl border border-border shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      aria-label={`Voir le concours ${title}`}
      tabIndex={0}
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted group-focus-within:scale-105 transition-transform duration-500 rounded-b-none rounded-t-3xl">
        {showImage ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🏛️</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-background/80 border border-border rounded-full px-2 py-0.5">
              Image indisponible
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow bg-white/80 border border-border ${st.text}`}
            style={{ letterSpacing: '0.02em' }}>
            <span className={`h-2 w-2 rounded-full ${st.dot} shadow-inner`} />
            {st.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pb-4">
        {/* Category + Rating */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-0.5 rounded-full shadow-sm">
            {category}
          </span>
          {/* Masquer le compteur s'il est à 0 ou non défini */}
          {typeof reviews === 'number' && reviews > 0 && rating && (
            <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating}</span>
              <span className="opacity-70">({reviews})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-4">
          {description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 opacity-70" />
            <span className="truncate max-w-[6rem]">{location}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3 opacity-70" />
            {date}
          </span>
          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
            <Clock className="h-3 w-3 opacity-80" />
            {deadline}
          </span>
        </div>
      </div>
    </Link>
  );
}
