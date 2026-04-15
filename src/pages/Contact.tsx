import { useState } from 'react';
import { Send, Phone, Mail, MapPin, CheckCircle, MessageCircle, Clock, Shield, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { submitContactApi } from '@/utils/api';

const contactInfo = [
  { icon: Phone, label: 'Téléphone', value: '+221 70 887 17 26', href: 'tel:+221708871726' },
  { icon: Mail, label: 'Email', value: 'contact@infosconcours.sn', href: 'mailto:contact@infosconcours.sn' },
  { icon: MapPin, label: 'Adresse', value: 'Dakar, Sénégal', href: null },
  { icon: Clock, label: 'Horaires', value: 'Lun-Ven, 8h-18h', href: null },
];

const faqs = [
  { q: 'Comment télécharger mes annales ?', a: 'Après paiement, vos annales sont disponibles immédiatement dans votre tableau de bord.' },
  { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons Wave et Orange Money pour le moment.' },
  { q: 'Puis-je obtenir un remboursement ?', a: 'Oui, dans les 48h suivant l\'achat si l\'annale n\'a pas été téléchargée.' },
];

const trustHighlights = [
  { icon: Clock, title: 'Reponse rapide', text: 'Retour de notre equipe en moins de 24h en moyenne.' },
  { icon: Shield, title: 'Echanges securises', text: 'Vos informations sont traitees avec confidentialite.' },
  { icon: Zap, title: 'Suivi concret', text: 'Chaque demande est orientee vers une action claire.' },
];

const processSteps = [
  'Vous envoyez votre besoin via le formulaire.',
  'Nous analysons votre demande et revenons avec une reponse utile.',
  'Nous vous accompagnons jusqu\'a resolution.',
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-flex h-20 w-20 rounded-3xl bg-primary/10 items-center justify-center mb-6 shadow-card">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">Message envoyé avec succès</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Merci pour votre confiance. Notre équipe vous répondra dans les plus brefs délais.</p>
        <button onClick={() => setSubmitted(false)} className="gradient-hero text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />

      <div className="container max-w-6xl relative">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-10">
          <div className="bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-7 md:p-9 shadow-card">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <MessageCircle className="h-4 w-4" /> Contact prioritaire
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold mb-4 leading-tight">On est là pour vous aider</h1>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg leading-relaxed">
              Une question sur les annales, les concours ou vos services ? Ecrivez-nous et recevez une reponse claire, utile et rapide.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">Reponse &lt; 24h</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/15 text-foreground">Support 7j/7</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card border border-border">Accompagnement humain</span>
            </div>
          </div>

          <div className="gradient-hero rounded-3xl p-7 md:p-9 text-primary-foreground shadow-soft border border-primary/20">
            <p className="text-xs uppercase tracking-wider text-primary-foreground/80 mb-2">Canal direct</p>
            <h2 className="text-2xl font-heading font-bold mb-2">Besoin d'une réponse immédiate ?</h2>
            <p className="text-primary-foreground/80 text-sm mb-6">Nos conseillers peuvent vous orienter rapidement vers la bonne ressource.</p>
            <div className="space-y-3">
              <a href="tel:+221708871726" className="flex items-center gap-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-xl px-4 py-3 border border-primary-foreground/15">
                <Phone className="h-5 w-5" />
                <div>
                  <p className="text-xs text-primary-foreground/70">Téléphone</p>
                  <p className="font-semibold">+221 70 887 17 26</p>
                </div>
              </a>
              <a href="mailto:contact@infosconcours.sn" className="flex items-center gap-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-xl px-4 py-3 border border-primary-foreground/15">
                <Mail className="h-5 w-5" />
                <div>
                  <p className="text-xs text-primary-foreground/70">Email</p>
                  <p className="font-semibold">contact@infosconcours.sn</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Trust highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {trustHighlights.map((item) => (
            <div key={item.title} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold text-base mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {contactInfo.map(info => (
            <a
              key={info.label}
              href={info.href || undefined}
              className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 text-center hover:shadow-card-hover hover:border-primary/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:gradient-hero transition-all">
                <info.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </div>
              <p className="text-sm font-semibold mb-0.5">{info.label}</p>
              <p className="text-xs text-muted-foreground">{info.value}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FAQ */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
              <h2 className="font-heading font-semibold text-lg mb-2">Comment nous traitons votre demande</h2>
              <div className="space-y-2">
                {processSteps.map((step) => (
                  <div key={step} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="font-heading font-semibold text-lg">Questions fréquentes</h2>
            {faqs.map((faq, i) => (
              <details key={i} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card">
                <summary className="text-sm font-semibold cursor-pointer">{faq.q}</summary>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={async e => {
              e.preventDefault();
              setLoading(true);
              try {
                await submitContactApi(form);
                setSubmitted(true);
                toast.success('Message envoyé !');
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Envoi impossible.';
                toast.error(message);
              } finally {
                setLoading(false);
              }
            }}
            className="lg:col-span-8 bg-card/95 backdrop-blur-md border border-border rounded-3xl p-7 md:p-8 space-y-5 h-fit shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading font-semibold text-2xl">Envoyez-nous un message</h3>
                <p className="text-sm text-muted-foreground mt-1">Temps de reponse moyen: moins de 24h.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold">
                <Shield className="h-3.5 w-3.5" /> Confidentiel
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="text-sm font-medium mb-1.5 block">Nom</label>
                <input
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="text-sm font-medium mb-1.5 block">Sujet</label>
              <input
                id="contact-subject"
                required
                value={form.subject}
                onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Sujet de votre message"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Votre message..."
              />
            </div>
            <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 gradient-hero text-primary-foreground py-4 rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60">
              <Send className="h-4 w-4" /> {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">En envoyant ce formulaire, vous acceptez d'etre recontacte pour le suivi de votre demande.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
