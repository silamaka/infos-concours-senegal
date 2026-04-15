import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

export default function Footer() {
  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/concours', label: 'Concours & Emplois' },
    { to: '/annales', label: 'Fascicules PDF' },
    { to: '/services', label: 'Nos Services' },
    { to: '/dashboard', label: 'Mon Espace' },
  ];

  const categories = [
    'Gendarmerie',
    'Police Nationale',
    'Armée',
    'Douanes',
    'Fonction Publique',
    'Bourses & CROUS',
    'Concours Santé',
  ];

  const socialLinks = [
    { label: 'Facebook', href: 'https://www.facebook.com', icon: Facebook },
    { label: 'YouTube', href: 'https://www.youtube.com', icon: Youtube },
    { label: 'Instagram', href: 'https://www.instagram.com', icon: Instagram },
  ];

  return (
    <footer className="bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-senegal-green" />
        <div className="bg-senegal-yellow" />
        <div className="bg-senegal-red" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-senegal-green/20 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-senegal-red/20 blur-3xl" />
      </div>

      <div className="container py-12 lg:py-14 relative">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img src={logo} alt="Infos Concours" className="h-12 w-12 rounded-full object-cover border border-white/20" />
              <div>
                <p className="font-heading text-2xl leading-none">Infos Concours</p>
                <p className="text-sm text-slate-300">Sénégal</p>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              La plateforme N°1 au Sénégal pour les concours, emplois, bourses et ressources pédagogiques.
            </p>

            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center justify-center hover:-translate-y-0.5 duration-200"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-xl text-senegal-yellow mb-5">Navigation</h4>
            <div className="flex flex-col gap-2">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="text-slate-300 hover:text-white transition-all text-base hover:translate-x-0.5">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-xl text-senegal-yellow mb-5">Catégories</h4>
            <ul className="space-y-2">
              {categories.map((item) => (
                <li key={item} className="text-slate-300 text-base">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xl text-senegal-yellow mb-5">Contact</h4>
            <div className="flex flex-col gap-4 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-senegal-green" />
                <span>+221 70 887 17 26</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-senegal-green mt-1" />
                <span>WhatsApp disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-senegal-yellow" />
                <span>contact@infosconcours.sn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-senegal-red" />
                <span>Dakar, Sénégal</span>
              </div>

              <div className="pt-2">
                <p className="text-sm text-slate-400 mb-2">Paiement accepté</p>
                <div className="flex flex-wrap gap-2">
                  {['Wave', 'Orange Money', 'Free Money'].map((method) => (
                    <span key={method} className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Infos Concours Sénégal. Tous droits réservés.</p>
          <p className="italic">Servir le Sénégal</p>
        </div>
      </div>
    </footer>
  );
}
