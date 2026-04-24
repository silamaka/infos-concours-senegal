import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

const trustPoints = [
  'Acces rapide a votre espace personnel',
  'Suivi des commandes et telechargements',
  'Parcours protege pour vos contenus',
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const state = location.state as LoginLocationState | null;
      const requestedPath = state?.from?.pathname;
      const safeTarget = requestedPath && requestedPath.startsWith('/') && requestedPath !== '/connexion'
        ? requestedPath
        : '/dashboard';
      navigate(safeTarget, { replace: true });
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
              <Sparkles className="h-3.5 w-3.5" /> Espace securise
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-heading font-extrabold tracking-tight">Retrouvez votre espace personnel</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Connectez-vous pour suivre vos commandes, recuperer vos ressources et reprendre votre parcours sans friction.
            </p>
            <div className="mt-8 grid gap-3">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground/85">{point}</span>
                </div>
              ))}
            </div>
          </div>
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold">Connexion</h1>
            <p className="text-muted-foreground text-sm mt-1">Accedez a vos commandes, vos telechargements et votre tableau de bord.</p>
          </div>

          {error && (
            <div role="alert" className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(error)}
                required
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm font-medium mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                  aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-hero text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">Creer un compte</Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
