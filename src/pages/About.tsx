import { Target, Users, BookOpen, Award, TrendingUp, Heart, Shield, Zap, CheckCircle2, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';

const stats = [
  { value: '2 000+', label: 'Candidats accompagnes' },
  { value: '50+', label: 'Annales disponibles' },
  { value: '95%', label: 'Satisfaction client' },
  { value: '24h', label: 'Delai de livraison' },
];

const milestones = [
  { year: '2021', title: 'Lancement', text: 'Mise en ligne de la premiere version dediee aux annales de concours.' },
  { year: '2023', title: 'Croissance', text: 'Extension du catalogue et amelioration du support candidat.' },
  { year: '2025', title: 'Professionnalisation', text: 'Ajout de services CV, lettre de motivation et suivi admin renforce.' },
  { year: '2026', title: 'Plateforme premium', text: 'Experience modernisee avec selection editoriale pilotee par l admin.' },
];

const values = [
  { icon: Target, title: 'Notre mission', text: "Democratiser l acces aux ressources de preparation aux concours au Senegal et dans toute l Afrique de l Ouest." },
  { icon: Users, title: 'Communaute', text: "Plus de 2000 candidats nous font confiance pour leur preparation aux concours et examens professionnels." },
  { icon: BookOpen, title: 'Ressources', text: "50+ annales corrigees, mises a jour chaque annee, couvrant les grands concours senegalais." },
  { icon: Award, title: 'Engagement', text: "Qualite, fiabilite et accompagnement personnalise pour maximiser vos chances de reussite." },
];

const team = [
  { name: 'Equipe editoriale', role: 'Redaction et correction des annales', icon: BookOpen },
  { name: 'Support Client', role: 'Assistance 7j/7 par WhatsApp', icon: Heart },
  { name: 'Developpement', role: 'Amelioration continue de la plateforme', icon: Zap },
  { name: 'Partenariats', role: 'Relations avec les institutions', icon: Shield },
];

const trustPoints = [
  'Catalogue mis a jour regulierement selon les sessions de concours.',
  'Equipe disponible pour guider les candidats avant et apres achat.',
  'Paiements et acces aux ressources penses pour une experience simple.',
  'Approche orientee resultat: qualite editoriale, clarte et reactivite.',
];

const faq = [
  {
    q: 'Comment garantissez-vous la qualite des annales ?',
    a: 'Chaque ressource passe par une relecture editoriale et une verification de coherence avant publication.',
  },
  {
    q: 'En combien de temps obtenons-nous de l aide ?',
    a: 'Le support repond rapidement, generalement dans la journee, avec un suivi personnalise selon le besoin.',
  },
  {
    q: 'Puis-je utiliser la plateforme meme si je debute ?',
    a: 'Oui. Les parcours sont penses pour etre clairs, avec des filtres, des sections a la une et des recommandations utiles.',
  },
];

export default function About() {
  return (
    <div className="py-8 md:py-12 relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-20" aria-hidden="true" />
      <div className="container max-w-5xl">
        <div className="mb-10">
          <PageHero
            badge="Plateforme de confiance"
            badgeIcon={MessageCircle}
            title="Une plateforme pensee pour aider les candidats a avancer avec confiance"
            description="Info Concours reunit ressources, accompagnement et services utiles dans une experience plus claire. Notre objectif est de faire gagner du temps, de la lisibilite et de la confiance."
            stats={stats}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map(s => (
            <div key={s.label} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 text-center hover:shadow-card-hover transition-shadow shadow-card">
              <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-14">
          <div className="lg:col-span-3 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-4">
              <img src={logo} alt="Info Concours Senegal" className="h-14 w-14 rounded-2xl object-cover shadow-card" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Notre histoire</p>
                <h2 className="text-2xl font-heading font-bold">Construire un point d'entree fiable</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Info Concours est nee d'un constat simple: beaucoup de candidats motives n'ont pas acces a des ressources structurees et fiables.
              Notre objectif est de rendre la preparation plus claire, plus accessible et plus efficace, grace a une plateforme concue pour les realites locales.
            </p>
            <div className="space-y-4">
              {milestones.map((item) => (
                <div key={item.year} className="flex gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <span className="inline-flex h-8 min-w-14 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold">{item.year}</span>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 shadow-card">
            <h3 className="font-heading font-bold text-lg mb-4">Pourquoi nous faire confiance</h3>
            <div className="space-y-3">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-14">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Nos valeurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(item => (
              <div key={item.title} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 hover:shadow-card-hover hover:border-primary/20 transition-all group shadow-card">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:gradient-hero transition-all">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-14">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Notre equipe</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {team.map(t => (
              <div key={t.name} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 text-center hover:shadow-card-hover transition-shadow shadow-card">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-0.5">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-14">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Questions frequentes</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faq.map((item) => (
              <details key={item.q} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
                <summary className="cursor-pointer font-semibold text-sm">{item.q}</summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="gradient-hero text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
          <TrendingUp className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Ensemble pour la reussite</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6">
            Chaque candidat qui reussit renforce notre pays. Nous sommes fiers de contribuer a former la prochaine generation de leaders senegalais.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/annales" className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors">
              Explorer les annales
            </Link>
            <Link to="/contact" className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
