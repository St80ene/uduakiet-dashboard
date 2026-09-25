import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { AxiosError } from 'axios';

import { authApi, type LoginPayload } from '../api/auth.api';
import axios from 'axios';
import { tokenStorage } from '../utils/token_storage.util';
import { AuthContext } from './AuthContext';
import type { IUser } from '@/interfaces/user.interface';
import Toast from '@/common/Toast';
import { API_BASE_URL, ApiTimeOut } from '@/services/api';

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
  const [isInitializing, setIsInitializing] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const hasInitializedRef = useRef(false);

  // 1. Hydrate session on page reload (Option B: Refresh returns tokens + user)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const restoreSession = async () => {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
            timeout: ApiTimeOut,
          },
        );

        // 🌟 Option B Payload: Expecting tokens AND user together
        const {
          accessToken,
          refreshToken: newRefreshToken,
          user: refreshedUser,
        } = response.data;

        tokenStorage.setTokens(accessToken, newRefreshToken);
        setHasAccessToken(true);
        setHasRefreshToken(true);
        setUser(refreshedUser); // Instantly hydrates user profile without a secondary /auth/me call
      } catch (error) {
        if (error instanceof AxiosError && !error.response) {
          setHasAccessToken(true);
          setHasRefreshToken(true);
          showToast('Network outage. Operating in offline mode.', 'info');
        } else if (
          error instanceof AxiosError &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          tokenStorage.clearTokens();
          setHasAccessToken(false);
          setHasRefreshToken(false);
          setUser(null);
          showToast('Session expired. Please log in again.', 'error');
        } else {
          setHasAccessToken(true);
          setHasRefreshToken(true);
          showToast(
            'Temporary server error. Some features may be limited.',
            'info',
          );
        }
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession().finally(() => setIsInitializing(false));
  }, []);

  //  Login handler
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

  //  Logout handler
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
  const isAuthenticated = !!user || hasAccessToken || hasRefreshToken;
  const isLoading = loginMutation.isPending || logoutMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
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
