import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './auth/utils/token_storage.util';

export const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL;

export const ApiTimeOut: number = 10000; // 10-second default timeout to catch slow networks gracefully

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: ApiTimeOut,
});

// 1. SINGLE REQUEST INTERCEPTOR
apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Automatically handle FormData content type
  if (config.data instanceof FormData && config.headers) {
    config.headers.setContentType('multipart/form-data');
  }

  return config;
});

// CONCURRENCY QUEUE MANAGEMENT
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeToRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const rejectRefreshSubscribers = () => {
  refreshSubscribers = [];
};

// 2. RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // A. HANDLE NETWORK OUTAGE / SLOW TIMEOUTS
    if (!error.response) {
      console.warn(
        'Network outage or timeout detected. Skipping token refresh.',
      );
      return Promise.reject(error);
    }

    // B. BYPASS NON-401 ERRORS & PREVENT INFINITE RETRY LOOPS
    if (error.response.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = tokenStorage.getRefreshToken();

    // C. NO REFRESH TOKEN FOUND
    if (!refreshToken) {
      tokenStorage.clearTokens();
      console.log('No refresh token available, logging out.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // D. QUEUE CONCURRENT REQUESTS ON SLOW NETWORKS
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newAccessToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          resolve(apiClient(originalRequest));
        });

        // Fail-safe timeout or rejection handling
      });
    }

    isRefreshing = true;
    console.log('Initiating silent token refresh...');

    try {
      // E. EXECUTING REFRESH
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

      const tokens = response.data.tokens || response.data;
      const { accessToken, refreshToken: newRefreshToken } = tokens;

      tokenStorage.setTokens(accessToken, newRefreshToken);

      // Notify all queued requests waiting for this new token
      notifyRefreshSubscribers(accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      rejectRefreshSubscribers();
      tokenStorage.clearTokens();

      // Only kick user to login if backend explicitly rejects refresh token (4xx)
      if (
        axios.isAxiosError(refreshError) &&
        refreshError.response &&
        refreshError.response.status < 500
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
