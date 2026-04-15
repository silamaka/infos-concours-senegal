import { Flame } from 'lucide-react';

export default function BadgePopulaire() {
  return (
    <span className="inline-flex items-center gap-1 bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs font-semibold">
      <Flame className="h-3 w-3" />
      Populaire
    </span>
  );
}
