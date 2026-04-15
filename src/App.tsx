import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import AdminLayout from "@/admin/AdminLayout";
import AdminOnlyRoute from "@/admin/AdminOnlyRoute";

const Home = lazy(() => import("./pages/Home"));
const ConcoursList = lazy(() => import("./pages/ConcoursList"));
const ConcoursDetail = lazy(() => import("./pages/ConcoursDetail"));
const CatalogAnnales = lazy(() => import("./pages/CatalogAnnales"));
const AnnaleDetail = lazy(() => import("./pages/AnnaleDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Payment = lazy(() => import("./pages/Payment"));
const Services = lazy(() => import("./pages/Services"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminPageDashboard = lazy(() => import("./admin/pages/Dashboard"));
const AnnalesAdmin = lazy(() => import("./admin/pages/AnnalesAdmin"));
const ConcoursAdmin = lazy(() => import("./admin/pages/ConcoursAdmin"));
const OrdersAdmin = lazy(() => import("./admin/pages/OrdersAdmin"));
const PaymentsAdmin = lazy(() => import("./admin/pages/PaymentsAdmin"));
const ServicesAdmin = lazy(() => import("./admin/pages/ServicesAdmin"));
const UsersAdmin = lazy(() => import("./admin/pages/UsersAdmin"));
const ContactAdmin = lazy(() => import("./admin/pages/ContactAdmin"));

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concours" element={<ConcoursList />} />
        <Route path="/concours/:id" element={<ConcoursDetail />} />
        <Route path="/annales" element={<CatalogAnnales />} />
        <Route path="/annales/:id" element={<AnnaleDetail />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/paiement" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/services" element={<Services />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <RouteErrorBoundary title="Erreur dans l'espace administration">
              <AdminOnlyRoute><AdminLayout /></AdminOnlyRoute>
            </RouteErrorBoundary>
          }
        >
          <Route index element={<AdminPageDashboard />} />
          <Route path="annales" element={<AnnalesAdmin />} />
          <Route path="concours" element={<ConcoursAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="payments" element={<PaymentsAdmin />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="users" element={<AdminOnlyRoute allowedRoles={["ADMIN"]}><UsersAdmin /></AdminOnlyRoute>} />
          <Route path="contact" element={<ContactAdmin />} />
        </Route>
        <Route path="/contact" element={<Contact />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:bg-card focus:text-foreground focus:px-3 focus:py-2 focus:rounded-md focus:border"
      >
        Aller au contenu principal
      </a>
      {!isAdminRoute && <Navbar />}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<Loader />}>
          <AppRoutes />
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppShell />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
