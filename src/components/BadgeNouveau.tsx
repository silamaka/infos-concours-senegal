import { Sparkles } from 'lucide-react';

export default function BadgeNouveau() {
  return (
    <span className="inline-flex items-center gap-1 bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
      <Sparkles className="h-3 w-3" />
      Nouveau
    </span>
  );
}
