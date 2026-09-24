import apiClient from '@/services/api';
import type { AuthUser, LoginResponse } from '../types/auth.type';
import { tokenStorage } from '../utils/token_storage.util';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/login',
      payload,
    );

    return data;
  },

  async refresh() {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post(
      `/auth/refresh`,
      {}, // Empty body since payload is in headers
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    return response.data;
  },

  async profile(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>('/auth/profile');

    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
