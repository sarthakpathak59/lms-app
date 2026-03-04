import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getErrorMessage } from '@/utils/error';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is not defined');
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _retryCount?: number;
};

let onSessionExpired: (() => Promise<void>) | null = null;

export const setSessionExpiredHandler = (handler: () => Promise<void>) => {
  onSessionExpired = handler;
};

const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isSessionManagedRoute = (url: string): boolean => {
  if (!url) {
    return false;
  }

  return !(
    url.startsWith('/public/') ||
    url.startsWith('/users/login') ||
    url.startsWith('/users/register') ||
    url.startsWith('/users/refresh-token')
  );
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

const refreshTokenFlow = async (): Promise<string | null> => {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await refreshClient.post('/users/refresh-token', {
      refreshToken,
    });

    const newAccessToken =
      response.data?.data?.accessToken || response.data?.accessToken || null;
    const newRefreshToken =
      response.data?.data?.refreshToken || response.data?.refreshToken || null;

    if (!newAccessToken) {
      return null;
    }

    await SecureStore.setItemAsync('access_token', newAccessToken);

    if (newRefreshToken) {
      await SecureStore.setItemAsync('refresh_token', newRefreshToken);
    }

    return newAccessToken;
  } catch {
    return null;
  }
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;
    const requestUrl = originalRequest?.url || '';

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please check your connection and retry.',
        code: 'TIMEOUT',
      });
    }

    const retryableNetworkError =
      error.code === 'ERR_NETWORK' ||
      error.message?.toLowerCase().includes('network') ||
      !error.response;

    const retryableServerError = (error.response?.status || 0) >= 500;

    if ((retryableNetworkError || retryableServerError) && originalRequest) {
      originalRequest._retryCount = originalRequest._retryCount ?? 0;

      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount += 1;
        await sleep(300 * originalRequest._retryCount);
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshTokenFlow();

      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      if (!isSessionManagedRoute(requestUrl)) {
        return Promise.reject({
          message: getErrorMessage(error),
          code: error.code,
          status: error.response?.status,
          raw: error,
        });
      }

      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');

      if (onSessionExpired) {
        await onSessionExpired();
      }

      return Promise.reject({
        message: 'Session expired. Please login again.',
        code: 'AUTH_EXPIRED',
      });
    }

    return Promise.reject({
      message: getErrorMessage(error),
      code: error.code,
      status: error.response?.status,
      raw: error,
    });
  }
);

export default api;
