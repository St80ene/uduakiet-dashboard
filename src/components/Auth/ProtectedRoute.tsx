import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/services/auth/hooks/useAuth';
import SplashScreen from '@/common/SplashScreen';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />; // You can replace this with your own loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
