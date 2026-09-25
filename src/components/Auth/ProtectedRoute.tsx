import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/services/auth/hooks/useAuth';

export function ProtectedRoute() {
  // Destructure isAuthenticated from your auth context hook
  const { isAuthenticated } = useAuth();

  // Safely redirect only if the authentication process is completed and the user is unauthorized
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
