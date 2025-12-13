import { API_ENDPOINTS } from '../../constants/api';
import type {
  AuthResponse,
  LoginCredentials,
} from '../../types/auth/auth';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';
import { grandlineAxiosClient } from './axios_client';

/**
 * Authentication Service (Driver-only)
 */
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await grandlineAxiosClient.post(
      API_ENDPOINTS.DRIVER.LOGIN,
      credentials
    );
    return unwrapAxiosResponse<AuthResponse>(response);
  },

  logout: async (): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await grandlineAxiosClient.post(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    return unwrapAxiosResponse<AuthResponse>(response);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.DRIVER.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (resetData: {
    token: string;
    newPassword: string;
  }): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.DRIVER.RESET_PASSWORD, resetData);
  },
};

