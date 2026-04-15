import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Trophy, FileText, Briefcase, Star, Shield, Zap, ChevronRight } from 'lucide-react';
import CardAnnale from '@/components/CardAnnale';
import CardConcours from '@/components/CardConcours';
import { Annale, Concours, getAnnalesApi, getConcoursApi } from '@/utils/api';
import AsyncState from '@/components/ui/async-state';
import heroIllustration from '@/assets/25649e325e90a8800d372503303c9668-removebg-preview.png';

export default function Home() {
  const [annales, setAnnales] = useState<Annale[]>([]);
  const [concours, setConcours] = useState<Concours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [annalesData, concoursData] = await Promise.all([getAnnalesApi(), getConcoursApi()]);
        if (!mounted) return;
        setAnnales(annalesData);
        setConcours(concoursData);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les donnees.');
        setAnnales([]);
        setConcours([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const popularAnnales = annales.filter(a => a.isPopular).slice(0, 4);
  const featuredConcours = concours.filter((c) => c.is_featured).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 mesh-overlay opacity-75" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.16]" aria-hidden="true" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-secondary rounded-full animate-pulse hidden md:block" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-secondary/60 rounded-full animate-pulse hidden md:block" />

        <div className="container relative">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 border border-primary-foreground/10">
                <Trophy className="h-4 w-4 text-secondary" />
                <span>Plateforme #1 des concours au Sénégal</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-[1.1] mb-5">
                Réussissez vos{' '}
                <span className="text-secondary relative">
                  concours
                  <svg className="absolute -bottom-1 left-0 w-full hidden md:block" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>{' '}
                avec les meilleures annales
              </h1>
              <p className="text-primary-foreground/80 text-base md:text-lg mb-8 leading-relaxed max-w-xl">
                Accédez aux annales corrigées, suivez les concours ouverts et boostez vos chances de réussite. Tout en un seul endroit.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/annales"
                  className="group inline-flex items-center gap-2 gradient-cta text-secondary-foreground px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all hover:shadow-lg"
                >
                  <BookOpen className="h-5 w-5" />
                  Voir les annales
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/concours"
                  className="group inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-primary-foreground/20 transition-all"
                >
                  Concours ouverts
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div
              className="relative hidden lg:flex justify-center lg:justify-end animate-fade-in"
              style={{ animationDelay: '120ms', animationDuration: '700ms' }}
            >
              <div className="relative w-full max-w-sm xl:max-w-md">
                <div
                  className="absolute -inset-6 rounded-full blur-3xl"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 42%, hsl(var(--secondary) / 0.34) 0%, hsl(var(--secondary) / 0.14) 46%, transparent 72%)',
                  }}
                  aria-hidden="true"
                />
                <img
                  src={heroIllustration}
                  alt="Illustration d'etudiants en preparation de concours"
                  className="relative h-[430px] xl:h-[520px] w-auto max-w-full object-contain origin-bottom-right translate-y-12 xl:translate-y-14 scale-[1.22] xl:scale-[1.3] drop-shadow-[0_28px_52px_rgba(0,0,0,0.3)]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-0 relative z-10">
        <div className="container -mt-8">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-soft p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FileText, label: 'Annales', value: '50+', color: 'text-primary' },
              { icon: Trophy, label: 'Concours suivis', value: '120+', color: 'text-secondary' },
              { icon: Briefcase, label: 'Services rendus', value: '300+', color: 'text-accent' },
              { icon: BookOpen, label: 'Utilisateurs', value: '2000+', color: 'text-primary' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-2`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-2xl md:text-3xl font-heading font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Pourquoi nous choisir</span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mt-4">Tout pour réussir vos concours</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Fiable & vérifié', desc: 'Annales authentiques vérifiées par nos experts pédagogiques.', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Zap, title: 'Accès instantané', desc: 'Téléchargez vos annales PDF immédiatement après paiement.', color: 'text-secondary', bg: 'bg-secondary/10' },
              { icon: Star, title: 'Support dédié', desc: 'Une équipe à votre écoute pour vous accompagner.', color: 'text-accent', bg: 'bg-accent/10' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Annales selectionnees par l'admin */}
      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Selection admin</span>
              <h2 className="text-2xl md:text-3xl font-heading font-bold mt-3">Annales a la une</h2>
            </div>
            <Link to="/annales" className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline group">
              Voir tout <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading || error || popularAnnales.length === 0 ? (
              <div className="lg:col-span-4 sm:col-span-2 bg-card/80 border border-border rounded-2xl p-6">
                <AsyncState
                  loading={loading}
                  error={error}
                  isEmpty={!loading && !error && popularAnnales.length === 0}
                  emptyMessage="Aucune annale a la une pour le moment."
                />
              </div>
            ) : (
              popularAnnales.map((a, i) => (
                <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardAnnale {...a} />
                </div>
              ))
            )}
          </div>
          <Link to="/annales" className="sm:hidden flex items-center justify-center gap-1 mt-6 text-sm text-primary font-medium">
            Voir toutes les annales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Concours selectionnes par l'admin */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-wider">Selection admin</span>
              <h2 className="text-2xl md:text-3xl font-heading font-bold mt-3">Concours a la une</h2>
            </div>
            <Link to="/concours" className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline group">
              Tous les concours <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading || error || featuredConcours.length === 0 ? (
              <div className="lg:col-span-3 sm:col-span-2 bg-card/80 border border-border rounded-2xl p-6">
                <AsyncState
                  loading={loading}
                  error={error}
                  isEmpty={!loading && !error && featuredConcours.length === 0}
                  emptyMessage="Aucun concours a la une pour le moment."
                />
              </div>
            ) : (
              featuredConcours.map((c, i) => (
                <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardConcours {...c} />
                </div>
              ))
            )}
          </div>
          <Link to="/concours" className="sm:hidden flex items-center justify-center gap-1 mt-6 text-sm text-primary font-medium">
            Voir tous les concours <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA Services */}
      <section className="py-16">
        <div className="container">
          <div className="relative gradient-cta rounded-3xl p-8 md:p-14 text-center overflow-hidden shadow-soft">
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-secondary-foreground/5 rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 bg-secondary-foreground/10 rounded-full px-4 py-1.5 text-sm text-secondary-foreground mb-5">
                <Briefcase className="h-4 w-4" />
                Services professionnels
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary-foreground mb-3">
                Besoin d'un CV ou d'une lettre de motivation ?
              </h2>
              <p className="text-secondary-foreground/70 mb-8 max-w-lg mx-auto">
                Nos experts vous accompagnent pour créer des documents professionnels qui font la différence.
              </p>
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all hover:shadow-lg"
              >
                Découvrir nos services
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
