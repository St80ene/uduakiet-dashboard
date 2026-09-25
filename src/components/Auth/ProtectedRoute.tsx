import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/services/auth/hooks/useAuth';

export function ProtectedRoute() {
  // 2. Destructure isInitializing from your auth context hook
  const { isAuthenticated } = useAuth();

  // 4. Safely redirect only if the initialization process is completed and the user is unauthorized
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
