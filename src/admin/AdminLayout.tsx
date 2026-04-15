import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar />
      {mobileNavOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
          />
          <AdminSidebar mobile onNavigate={() => setMobileNavOpen(false)} onClose={() => setMobileNavOpen(false)} />
        </>
      )}
      <div className="flex-1 min-w-0">
        <AdminHeader onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
