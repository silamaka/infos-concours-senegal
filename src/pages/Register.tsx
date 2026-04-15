import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

const benefits = [
  'Un compte unique pour suivre commandes et annales',
  'Acces plus rapide au paiement et aux telechargements',
  'Un espace personnel simple a retrouver a tout moment',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caracteres');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] py-10 md:py-14 relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-20" aria-hidden="true" />
      <div className="container max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center">
          <div className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-card backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Demarrage rapide
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-heading font-extrabold tracking-tight">Creez votre compte et gardez le fil de votre preparation</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              L inscription vous donne un espace simple pour commander, retrouver vos achats et avancer sans recommencer a chaque visite.
            </p>
            <div className="mt-8 grid gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground/85">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold">Inscription</h1>
            <p className="text-muted-foreground text-sm mt-1">Creez votre compte en quelques secondes pour demarrer un parcours plus fluide.</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="text-sm font-medium mb-1.5 block">Nom complet</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Moussa Diop"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="text-sm font-medium mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="register-confirm-password" className="text-sm font-medium mb-1.5 block">Confirmer le mot de passe</label>
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-hero text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creation...' : 'Creer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Deja un compte ?{' '}
            <Link to="/connexion" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
