import { LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminHeader({ onToggleMobileNav }: { onToggleMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  return (
    <header className="h-16 border-b border-border bg-card/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border hover:bg-muted"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
        <h1 className="font-heading font-semibold text-lg">Administration</h1>
        <p className="text-xs text-muted-foreground">Gestion globale de la plateforme</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {user?.role || 'ADMIN'}
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
