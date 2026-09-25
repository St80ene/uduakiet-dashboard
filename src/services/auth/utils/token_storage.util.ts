const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY;

export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
