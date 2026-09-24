import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { AxiosError } from 'axios';

import { authApi, type LoginPayload } from '../api/auth.api';
import { tokenStorage } from '../utils/token_storage.util';
import { AuthContext } from './AuthContext';
import type { IUser } from '@/interfaces/user.interface';
import Toast from '@/common/Toast';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const queryClient = useQueryClient();

  const [hasAccessToken, setHasAccessToken] = useState(
    () => !!tokenStorage.getAccessToken(),
  );
  const [hasRefreshToken, setHasRefreshToken] = useState(
    () => !!tokenStorage.getRefreshToken(),
  );
  const [user, setUser] = useState<IUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // 1. STATE MANAGEMENT FOR TOASTS
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    // Auto-dismiss toast after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  // Hydrate session on page reload
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = tokenStorage.getRefreshToken();

      console.log('Restoring session. Refresh token:', refreshToken);

      if (refreshToken) {
        setIsInitializing(true);
        try {
          const { tokens, user: refreshedUser } = await authApi.refresh();
          console.log(
            'Session restored. New tokens:',
            tokens,
            'User:',
            refreshedUser,
          );
          tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
          setHasAccessToken(true);
          setHasRefreshToken(true);
          setUser(refreshedUser);
        } catch (error) {
          if (error instanceof AxiosError && !error.response) {
            console.warn(
              'Network outage during session restoration. Preserving tokens.',
            );
            setHasAccessToken(true);
            setHasRefreshToken(true);
            showToast('Network outage. Operating in offline mode.', 'info');
            setIsInitializing(false);
          } else {
            tokenStorage.clearTokens();
            setHasAccessToken(false);
            setHasRefreshToken(false);
            setUser(null);
            showToast('Session expired. Please log in again.', 'error');
          }
        } finally {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();
  }, []);

  // Login handler
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginPayload) => authApi.login(credentials),
    onSuccess: (response) => {
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      setHasAccessToken(true);
      setHasRefreshToken(true);
      setUser(response.user);
      showToast('Welcome back! Successfully logged in.', 'success');
    },
  });

  // Logout handler
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      tokenStorage.clearTokens();
      setHasAccessToken(false);
      setHasRefreshToken(false);
      setUser(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      showToast('Successfully logged out.', 'info');
    },
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      return response.user;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (!error.response) {
          const networkMsg =
            'Network error. Please check your internet connection.';
          showToast(networkMsg, 'error');
          throw new Error(networkMsg, { cause: error });
        }
        const apiMsg =
          error.response.data?.message || 'Invalid email or password';
        showToast(apiMsg, 'error');
        throw new Error(apiMsg, { cause: error });
      }
      throw error;
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loginMutation.isPending || logoutMutation.isPending,
        isAuthenticated:
          (!!hasAccessToken && (!!user || !navigator.onLine)) ||
          (hasRefreshToken && (!!user || !navigator.onLine)),
        isInitializing,
        login,
        logout,
      }}
    >
      {children}

      {/* 2. INJECT CONDITIONAL TOAST AT CONTAINER LEVEL */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
}
