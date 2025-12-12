import { API_ENDPOINTS } from '../../constants/api';
import type {
    AuthResponse,
    LoginCredentials,
} from '../../types/auth/auth';
import { grandlineAxiosClient } from './axios_client';

/**
 * Authentication Service
 */
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await grandlineAxiosClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await grandlineAxiosClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (resetData: {
    token: string;
    newPassword: string;
  }): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
  },
};

