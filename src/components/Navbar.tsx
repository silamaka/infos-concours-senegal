import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.jpeg';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/concours', label: 'Concours' },
  { to: '/annales', label: 'Annales' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate('/');
  };

  useEffect(() => {
    setOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Accessibilite: focus trap sur menu utilisateur, fermeture mobile menu par Echap
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!userMenu) return;
      const target = event.target as Node;
      const insideMenu = userMenuRef.current?.contains(target);
      const insideButton = userMenuButtonRef.current?.contains(target);
      if (!insideMenu && !insideButton) {
        setUserMenu(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenu(false);
        setOpen(false);
      }
      // Focus trap menu utilisateur
      if (userMenu && event.key === 'Tab' && userMenuRef.current) {
        const focusable = userMenuRef.current.querySelectorAll<HTMLElement>(
          'a,button,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    // Focus sur bouton menu utilisateur à l’ouverture
    if (userMenu) setTimeout(() => { userMenuButtonRef.current?.focus(); }, 100);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [userMenu]);

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-border shadow-soft'
          : 'bg-white border-border/70'
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Info Concours" className="h-14 w-14 rounded-full object-cover" />
          <span className="font-heading font-bold text-lg hidden sm:block">
            <span className="text-primary">Info</span>{' '}
            <span className="text-secondary">Concours</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-1.5 py-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActivePath(link.to) ? 'text-primary bg-primary/10 shadow-sm' : 'text-foreground/70 hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/panier" aria-label="Ouvrir le panier" className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative">
              <button
                ref={userMenuButtonRef}
                onClick={() => setUserMenu(!userMenu)}
                aria-haspopup="menu"
                aria-expanded={userMenu}
                aria-controls="user-menu"
                aria-label="Ouvrir le menu utilisateur"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <div className="h-8 w-8 rounded-full gradient-hero flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.name}</span>
              </button>
              {userMenu && (
                <div ref={userMenuRef} id="user-menu" role="menu" className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                  <Link to="/dashboard" role="menuitem" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <User className="h-4 w-4" /> Mon compte
                  </Link>
                  {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                    <Link to="/admin" role="menuitem" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                      <ShieldCheck className="h-4 w-4" /> Admin
                    </Link>
                  )}
                  <button role="menuitem" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive">
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/inscription"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground/80 hover:bg-muted transition-colors"
              >
                Inscription
              </Link>
              <Link
                to="/connexion"
                className="gradient-hero text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
              >
                <User className="h-4 w-4" /> Connexion
              </Link>
            </div>
          )}

          <button
            className="p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="container py-4">
            <div className="rounded-2xl border border-border/80 bg-background/80 p-2 shadow-card flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActivePath(link.to) ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted">
                  Mon compte
                </Link>
                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted">
                    Admin
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setOpen(false); }} className="px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-muted text-left">
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Link to="/connexion" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-primary bg-primary/10">
                  Connexion
                </Link>
                <Link to="/inscription" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/80 hover:bg-muted inline-flex items-center justify-between">
                  Inscription
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
