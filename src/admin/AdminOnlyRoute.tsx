import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';

type Role = 'USER' | 'STAFF' | 'ADMIN';

export default function AdminOnlyRoute({
  children,
  allowedRoles = ['ADMIN', 'STAFF'],
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location }} />;
  if (!allowedRoles.includes(user.role as Role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
