import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-20" aria-hidden="true" />
      <div className="text-center bg-card/95 backdrop-blur-md border border-border rounded-2xl p-10 shadow-soft max-w-lg mx-4">
        <div className="h-14 w-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
          <Compass className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mb-2 text-5xl font-bold font-heading">404</h1>
        <p className="mb-6 text-muted-foreground">Cette page n'existe pas ou a ete deplacee.</p>
        <Link to="/" className="inline-flex gradient-hero text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Retour a l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
