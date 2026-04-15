import { Link, useLocation } from 'react-router-dom';
import { BookOpen, ClipboardList, CreditCard, Gauge, MessageSquare, Trophy, UserCog, Users, Wrench, X } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: Gauge },
  { to: '/admin/annales', label: 'Annales', icon: BookOpen },
  { to: '/admin/concours', label: 'Concours', icon: Trophy },
  { to: '/admin/orders', label: 'Commandes', icon: ClipboardList },
  { to: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { to: '/admin/services', label: 'Services', icon: Wrench },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/contact', label: 'Contact', icon: MessageSquare },
];

export default function AdminSidebar({
  mobile = false,
  onNavigate,
  onClose,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const location = useLocation();

  const isLinkActive = (to: string) => {
    if (to === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <aside className={`${mobile ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden lg:flex sticky top-0'} w-72 flex-col border-r border-border bg-card/95 backdrop-blur-md h-screen`}>
      <div className="h-16 px-5 flex items-center border-b border-border">
        <div className="h-9 w-9 rounded-lg gradient-hero flex items-center justify-center mr-3">
          <UserCog className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-heading font-semibold leading-tight">Admin Panel</p>
          <p className="text-xs text-muted-foreground">Infos Concours Sénégal</p>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-md border border-border hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="p-3 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const active = isLinkActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground/70 hover:bg-muted'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
