import { type LucideIcon } from 'lucide-react';

interface HeroStat {
  label: string;
  value: string;
}

interface PageHeroProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  description: string;
  stats?: HeroStat[];
}

export default function PageHero({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  stats = [],
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/85 px-6 pt-0 pb-2 shadow-card backdrop-blur-xl md:px-8 md:pt-0 md:pb-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(145_63%_32%_/_0.12),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(45_100%_51%_/_0.14),transparent_34%)]" aria-hidden="true" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <BadgeIcon className="h-3.5 w-3.5" />
          {badge}
        </div>
        <div className="mt-5 max-w-3xl">
          <h1 className="text-3xl font-heading font-extrabold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
        </div>
        {stats.length > 0 && (
          <div className="mt-7 flex gap-4 w-full">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex-1 min-w-[160px] rounded-2xl border border-border/70 bg-background/70 px-4 py-3 flex flex-col justify-center items-start"
              >
                <p className="text-xl font-heading font-bold text-foreground md:text-2xl">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
