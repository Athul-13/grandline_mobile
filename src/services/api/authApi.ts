import apiClient from './axiosConfig';
import { API_ENDPOINTS, ApiResponse } from '../../constants/api';
import { LoginCredentials, User, AuthResponse } from '../../types/auth';

// Authentication API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error: any) {
      // Even if logout fails on server, we should clear local state
      console.warn('Logout API call failed:', error.message);
    }
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Forgot password request failed');
    }
  },

  // Reset password
  resetPassword: async (resetData: {
    token: string;
    newPassword: string;
  }): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_ENDPOINTS.USER.PROFILE
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  },
};
