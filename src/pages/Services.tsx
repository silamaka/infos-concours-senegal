import { useState } from 'react';
import { Send, FileText, PenTool, Palette, CheckCircle, Star, ArrowRight, Sparkles, Shield, Clock, Users, Zap, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { submitServiceRequestApi } from '@/utils/api';

const services = [
  { id: 'cv', label: 'Rédaction de CV', icon: FileText, price: '5 000 FCFA', description: 'CV professionnel adapté au marché sénégalais et international.', features: ['Design moderne & épuré', 'Optimisé ATS', 'Format PDF & Word', 'Livraison sous 48h'], color: 'primary' },
  { id: 'lettre', label: 'Lettre de motivation', icon: PenTool, price: '3 500 FCFA', description: 'Lettre percutante qui capte l\'attention des recruteurs.', features: ['Personnalisée au poste', 'Structure argumentée', 'Ton professionnel', 'Livraison sous 48h'], color: 'secondary' },
  { id: 'design', label: 'Création graphique', icon: Palette, price: '10 000 FCFA', description: 'Supports graphiques pour vos projets et candidatures.', features: ['Flyers & affiches', 'Logos personnalisés', 'Posts réseaux sociaux', 'Fichiers source inclus'], color: 'accent' },
];

const testimonials = [
  { name: 'Fatou D.', role: 'Candidate Gendarmerie', text: 'Mon CV a été complètement transformé. J\'ai décroché 3 entretiens en une semaine !', rating: 5, avatar: 'F' },
  { name: 'Mamadou S.', role: 'Candidat ENA', text: 'La lettre de motivation était parfaitement adaptée au concours. Très professionnel.', rating: 5, avatar: 'M' },
  { name: 'Aissatou B.', role: 'Étudiante', text: 'Service rapide et de qualité. Je recommande à 100%. Design incroyable !', rating: 4, avatar: 'A' },
];

const stats = [
  { icon: Users, value: '2 500+', label: 'Clients satisfaits' },
  { icon: Clock, value: '48h', label: 'Délai moyen' },
  { icon: Shield, value: '100%', label: 'Satisfaction garantie' },
  { icon: Zap, value: '95%', label: 'Taux de réussite' },
];

const processSteps = [
  'Sélectionnez le service adapté à votre besoin.',
  'Envoyez vos informations via le formulaire sécurisé.',
  'Notre équipe vous recontacte sous 24h avec un plan clair.',
];

export default function Services() {
  const [selectedService, setSelectedService] = useState('cv');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    target: '',
    details: '',
    // Champs spécifiques CV
    experience: '',
    formation: '',
    // Champs spécifiques Design
    dimensions: '',
    style: '',
    usage: '',
    // Fichier optionnel
    file: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Créer un objet de données de base
      const baseData = {
        service_type: selectedService,
        name: form.name,
        email: form.email,
        phone: form.phone,
        target: form.target,
        details: form.details,
      };

      // Ajouter les champs spécifiques selon le service
      let enrichedData = { ...baseData };
      
      if (selectedService === 'cv') {
        enrichedData = {
          ...enrichedData,
          details: `${baseData.details}\n\nExpérience: ${form.experience}\nFormation: ${form.formation}`,
        };
      } else if (selectedService === 'design') {
        enrichedData = {
          ...enrichedData,
          details: `${baseData.details}\n\nDimensions: ${form.dimensions}\nStyle: ${form.style}\nUsage: ${form.usage}`,
        };
      }

      // Ajouter l'information sur le fichier si présent
      if (form.file) {
        enrichedData = {
          ...enrichedData,
          details: `${enrichedData.details}\n\nFichier joint: ${form.file.name} (${(form.file.size / 1024 / 1024).toFixed(1)}MB)`,
        };
      }

      await submitServiceRequestApi({
        service_type: selectedService,
        name: form.name,
        email: form.email,
        phone: form.phone,
        target: form.target,
        details: enrichedData.details,
        file: form.file,
      });
      setSubmitted(true);
      toast.success('Demande envoyée !');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Envoi impossible.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-flex h-20 w-20 rounded-3xl bg-primary/10 items-center justify-center mb-6 animate-fade-in shadow-card">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">Demande envoyée avec succès</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Nous vous contacterons sous 24h pour finaliser votre commande.</p>
        <button onClick={() => setSubmitted(false)} className="gradient-hero text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Commander un autre service
        </button>
      </div>
    );
  }

  const selected = services.find(s => s.id === selectedService)!;

  return (
    <div className="py-10 md:py-16 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-25" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />

      <div className="container max-w-6xl relative">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-12">
          <div className="bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-7 md:p-9 shadow-card">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Services professionnels
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold mb-4 leading-tight">
              Boostez votre <span className="text-primary">candidature</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg leading-relaxed">
              Des services professionnels conçus pour maximiser vos chances de réussite aux concours et dans votre carrière.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">Livraison rapide</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/15 text-foreground">Accompagnement humain</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card border border-border">Qualité éditoriale</span>
            </div>
          </div>

          <div className="gradient-hero rounded-3xl p-7 md:p-9 text-primary-foreground shadow-soft border border-primary/20">
            <p className="text-xs uppercase tracking-wider text-primary-foreground/80 mb-2">Parcours simple</p>
            <h2 className="text-2xl font-heading font-bold mb-3">Comment ça marche</h2>
            <div className="space-y-3">
              {processSteps.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl px-3 py-2.5 border border-primary-foreground/15">
                  <span className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                  <p className="text-sm text-primary-foreground/90 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((s, i) => (
            <div key={i} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 text-center shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl md:text-2xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Service cards — premium style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {services.map((s) => {
            const isActive = selectedService === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`group relative p-6 rounded-2xl border text-left transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-card-hover ring-2 ring-primary/20 scale-[1.02]'
                    : 'border-border bg-card hover:shadow-card-hover hover:border-primary/30 hover:scale-[1.01]'
                }`}
              >
                {/* Top accent strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                  isActive ? 'gradient-hero opacity-100' : 'opacity-0 group-hover:opacity-50 gradient-hero'
                }`} />
                
                {isActive && (
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full gradient-hero flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                  isActive ? 'gradient-hero shadow-lg' : 'bg-muted group-hover:bg-primary/10'
                }`}>
                  <s.icon className={`h-7 w-7 transition-colors ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{s.label}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-heading font-bold text-primary">{s.price}</p>
                  <ArrowRight className={`h-5 w-5 transition-all ${isActive ? 'text-primary translate-x-0' : 'text-muted-foreground -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Details + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Features + Testimonials */}
          <div className="lg:col-span-2 space-y-6">
            {/* Features */}
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 shadow-card">
              <h3 className="font-heading font-bold text-lg mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                Ce qui est inclus
              </h3>
              <ul className="space-y-4">
                {selected.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonials */}
            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Avis clients</h3>
              <div className="space-y-4">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground text-sm font-bold">{t.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 bg-card/95 backdrop-blur-md border border-border rounded-3xl p-8 space-y-5 h-fit shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center">
                <selected.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl">Commander : {selected.label}</h3>
                <p className="text-sm text-muted-foreground">Remplissez le formulaire et nous vous contacterons sous 24h.</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                <Shield className="h-3.5 w-3.5" /> Confidentiel
              </span>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Téléphone</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="+221 7X XXX XX XX"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Poste ou concours visé</label>
              <input
                value={form.target}
                onChange={e => setForm(prev => ({ ...prev, target: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="Ex: Concours Gendarmerie 2026"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Détails de votre demande</label>
              <textarea
                required
                rows={4}
                value={form.details}
                onChange={e => setForm(prev => ({ ...prev, details: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                placeholder={selectedService === 'cv' ? 'Décrivez votre parcours, vos compétences, le poste visé...' : selectedService === 'design' ? 'Décrivez votre projet, vos préférences, l\'usage prévu...' : 'Décrivez vos besoins, votre parcours, le poste visé...'}
              />
            </div>

            {/* Champs spécifiques selon le service */}
            {selectedService === 'cv' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Années d'expérience</label>
                  <input
                    value={form.experience}
                    onChange={e => setForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    placeholder="Ex: 3 ans"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Formation principale</label>
                  <input
                    value={form.formation}
                    onChange={e => setForm(prev => ({ ...prev, formation: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    placeholder="Ex: Licence en informatique"
                  />
                </div>
              </div>
            )}

            {selectedService === 'design' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Dimensions souhaitées</label>
                    <input
                      value={form.dimensions}
                      onChange={e => setForm(prev => ({ ...prev, dimensions: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      placeholder="Ex: A4, 1080x1080px, carré Instagram"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Style/Thème</label>
                    <input
                      value={form.style}
                      onChange={e => setForm(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      placeholder="Ex: Moderne, Élégant, Coloré, Minimaliste"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Usage prévu</label>
                  <select
                    value={form.usage}
                    onChange={e => setForm(prev => ({ ...prev, usage: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  >
                    <option value="">Sélectionnez l'usage</option>
                    <option value="web">Web / Réseaux sociaux</option>
                    <option value="print">Impression / Affiche</option>
                    <option value="logo">Logo / Identité visuelle</option>
                    <option value="presentation">Présentation / PowerPoint</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
            )}

            {/* Fichier optionnel pour tous les services */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Fichier joint (optionnel)
                <span className="text-xs text-muted-foreground ml-2">PDF, Word, Image - Max 10MB</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => setForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {form.file && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(1)}MB)
                  </div>
                )}
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 gradient-hero text-primary-foreground py-4 rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60">
              <Send className="h-5 w-5" /> {loading ? 'Envoi en cours...' : `Envoyer ma demande — ${selected.price}`}
            </button>
            <p className="text-xs text-muted-foreground text-center">Paiement sécurisé · Satisfaction garantie ou remboursé</p>
          </form>
        </div>
      </div>
    </div>
  );
}
