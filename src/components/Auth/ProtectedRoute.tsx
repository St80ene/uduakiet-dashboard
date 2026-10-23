import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/services/auth/hooks/useAuth';

/**
 * Ensures the user is logged in.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner/state while checking auth token/session
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F7F6F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve current location in state so user can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
