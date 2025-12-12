import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../constants/api';
import { refreshUserToken } from '../../store/slices/auth_slice';
import { store } from '../../store/store';

/**
 * Shared refresh token promise to prevent multiple simultaneous refresh attempts
 * When multiple requests fail with 401, they all wait for a single refresh
 */
let refreshTokenPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

/**
 * Create and configure Axios instance
 * Handles authentication, error handling, and request/response interceptors
 */
export const grandlineAxiosClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

grandlineAxiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth state from Redux store
    const state = store.getState();
    const { accessToken } = state.auth;

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request in development
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

grandlineAxiosClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle network errors
    if (!error.response) {
      // Network error (no internet, server down, etc.)
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if this is already a refresh, login, or logout request
      const isRefreshRequest = originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      const isLoginRequest = originalRequest.url?.includes(API_ENDPOINTS.DRIVER.LOGIN);
      const isLogoutRequest = originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGOUT);

      if (isRefreshRequest || isLoginRequest || isLogoutRequest) {
        // Extract the original error message from the response
        const errorMessage =
          (data as { message?: string })?.message ||
          (data as { error?: string })?.error ||
          'Your session has expired. Please login again.';

        return Promise.reject({
          message: errorMessage,
          code: 'UNAUTHORIZED',
        });
      }

      // Check if user is still authenticated before trying to refresh
      const currentState = store.getState();
      if (!currentState.auth.isAuthenticated) {
        // User is already logged out - don't try to refresh, just reject
        return Promise.reject({
          message: 'Your session has expired. Please login again.',
          code: 'UNAUTHORIZED',
        });
      }

      // If a refresh is already in progress, wait for it and retry this request
      if (refreshTokenPromise) {
        try {
          await refreshTokenPromise;
          // Refresh completed - retry the original request
          return grandlineAxiosClient(originalRequest);
        } catch {
          // Refresh failed - reject this request
          return Promise.reject({
            message: 'Your session has expired. Please login again.',
            code: 'UNAUTHORIZED',
          });
        }
      }

      // Start a new refresh attempt
      refreshTokenPromise = (async () => {
        try {
          const result = await store.dispatch(refreshUserToken()).unwrap();
          if (result) {
            return {
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            };
          }
          throw new Error('Token refresh failed');
        } catch (refreshError) {
          // Refresh failed - clear auth will be handled by the slice
          throw refreshError;
        } finally {
          // Clear the refresh promise so new 401s can trigger a new refresh
          refreshTokenPromise = null;
        }
      })();

      // Wait for refresh and retry this request
      try {
        await refreshTokenPromise;
        // Refresh successful - retry the original request
        return grandlineAxiosClient(originalRequest);
      } catch {
        // Refresh failed - reject this request
        return Promise.reject({
          message: 'Your session has expired. Please login again.',
          code: 'UNAUTHORIZED',
        });
      }
    }

    // Handle 403 Forbidden
    if (status === HTTP_STATUS.FORBIDDEN) {
      return Promise.reject({
        message: 'You do not have permission to access this resource.',
        code: 'FORBIDDEN',
      });
    }

    // Handle 404 Not Found
    if (status === HTTP_STATUS.NOT_FOUND) {
      return Promise.reject({
        message: 'The requested resource was not found.',
        code: 'NOT_FOUND',
      });
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
      });
    }

    // Extract error message from response
    const errorMessage =
      (data as { message?: string })?.message ||
      (data as { error?: string })?.error ||
      error.message ||
      'An error occurred. Please try again.';

    return Promise.reject({
      message: errorMessage,
      code: status.toString(),
      data: data,
    });
  }
);

export default grandlineAxiosClient;

