import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'ats_access_token';
const REFRESH_TOKEN_KEY = 'ats_refresh_token';

export const CLOUDFLARE_TUNNEL_URL = 'https://hey-qld-declared-switching.trycloudflare.com';
export const LOCAL_LAN_URL = 'http://192.168.1.35:3000/api/v1';

// Automatically resolve backend host based on platform and Expo environment
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    const raw = process.env.EXPO_PUBLIC_API_URL.trim().replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }

  // If running via Expo Go or Dev Client on a physical phone, resolve dev machine's LAN IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip.includes('exp.direct')) {
      return `${CLOUDFLARE_TUNNEL_URL}/api/v1`;
    }
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000/api/v1`;
    }
  }

  // Fallback to active cloudflare tunnel URL
  return `${CLOUDFLARE_TUNNEL_URL}/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

export const setApiBaseUrl = (newUrl: string) => {
  const formatted = newUrl.endsWith('/api/v1') ? newUrl : `${newUrl.replace(/\/+$/, '')}/api/v1`;
  apiClient.defaults.baseURL = formatted;
};

export const getServerRoot = (): string => {
  const base = apiClient.defaults.baseURL || API_BASE_URL;
  return base.replace(/\/api\/v1\/?$/, '');
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

// Storage helper utilities for tokens (with Web localStorage fallback)
export const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  inMemoryAccessToken = accessToken;
  inMemoryRefreshToken = refreshToken;
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (err) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) inMemoryAccessToken = token;
      return token;
    }
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) inMemoryAccessToken = token;
    return token;
  } catch {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (token) inMemoryRefreshToken = token;
      return token;
    }
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (token) inMemoryRefreshToken = token;
    return token;
  } catch {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};


// Request Interceptor: Attach Bearer JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Seamless Refresh Token Rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Do NOT intercept or refresh on auth login or refresh requests
    if (originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const baseUrl = apiClient.defaults.baseURL || API_BASE_URL;
        const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
          refreshToken,
        });

        await storeTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
