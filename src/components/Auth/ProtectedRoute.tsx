import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/services/auth/hooks/useAuth';
import SplashScreen from '@/common/SplashScreen';

export function ProtectedRoute() {
  // 2. Destructure isInitializing from your auth context hook
  const { isAuthenticated, isLoading, isInitializing } = useAuth();
  console.log(
    'ProtectedRoute - isAuthenticated:',
    isAuthenticated,
    'isLoading:',
    isLoading,
    'isInitializing:',
    isInitializing,
  );

  // 3. Keep showing the splash screen while verifying the token on reload
  if (isInitializing || isLoading) {
    return <SplashScreen />;
  }

  // 4. Safely redirect only if the initialization process is completed and the user is unauthorized
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
