import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './auth/utils/token_storage.util';
import { toast } from 'react-toastify';

export const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL;

export const ApiTimeOut: number = 10000; // 10-second default timeout

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: ApiTimeOut,
});

// 1. REQUEST INTERCEPTOR
apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

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
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // A. HANDLE NETWORK OUTAGE / SLOW TIMEOUTS GLOBALLY
    if (!error.response) {
      toast.error(
        'Network outage or timeout detected. Please check your connection.',
      );
      return Promise.reject(error);
    }

    // B. HANDLE 403 FORBIDDEN GLOBALLY
    if (status === 403) {
      toast.error(
        'Access Denied: You do not have permission to perform this action.',
      );
      return Promise.reject(error);
    }

    // C. PASS NON-401 ERRORS STRAIGHT TO THE COMPONENT (400, 404, 422, 500, etc.)
    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // --- D. TOKEN REFRESH FLOW (Only for 401 Unauthorized) ---
    originalRequest._retry = true;
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newAccessToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          resolve(apiClient(originalRequest));
        });

        setTimeout(() => {
          reject(new Error('Token refresh queue timeout'));
        }, 20000);
      });
    }

    isRefreshing = true;

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

      const tokens = response.data.tokens || response.data;
      const { accessToken, refreshToken: newRefreshToken } = tokens;

      tokenStorage.setTokens(accessToken, newRefreshToken);
      notifyRefreshSubscribers(accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      rejectRefreshSubscribers();
      tokenStorage.clearTokens();

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
