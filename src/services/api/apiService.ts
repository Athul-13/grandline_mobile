import { LoginCredentials, User, AuthResponse, PasswordChangeData, DriverOnboardingData } from '../../types/auth';
import { ApiResponse } from '../../constants/api';
import { mockApi } from './mockApi';
import { authApi as realAuthApi } from './authApi';
import { API_CONFIG } from '../../config/apiConfig';

// API Service that can switch between mock and real API
export const apiService = {
  // Authentication endpoints
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.auth.login(credentials);
        return response.data;
      } else {
        return await realAuthApi.login(credentials);
      }
    },

    logout: async (): Promise<void> => {
      if (API_CONFIG.USE_MOCK_API) {
        await mockApi.auth.logout();
      } else {
        await realAuthApi.logout();
      }
    },

    changePassword: async (passwordData: PasswordChangeData): Promise<void> => {
      if (API_CONFIG.USE_MOCK_API) {
        await mockApi.auth.changePassword(passwordData);
      } else {
        await realAuthApi.changePassword(passwordData);
      }
    },

    refreshToken: async (): Promise<AuthResponse> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.auth.refreshToken();
        return response.data;
      } else {
        return await realAuthApi.refreshToken();
      }
    },

    forgotPassword: async (email: string): Promise<void> => {
      if (API_CONFIG.USE_MOCK_API) {
        await mockApi.auth.forgotPassword(email);
      } else {
        await realAuthApi.forgotPassword(email);
      }
    },

    resetPassword: async (resetData: { token: string; newPassword: string }): Promise<void> => {
      if (API_CONFIG.USE_MOCK_API) {
        await mockApi.auth.resetPassword(resetData);
      } else {
        await realAuthApi.resetPassword(resetData);
      }
    },

    verifyEmail: async (token: string): Promise<void> => {
      if (API_CONFIG.USE_MOCK_API) {
        await mockApi.auth.verifyEmail(token);
      } else {
        await realAuthApi.verifyEmail(token);
      }
    },
  },

  // User endpoints
  user: {
    getProfile: async (): Promise<User> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.user.getProfile();
        return response.data;
      } else {
        return await realAuthApi.getCurrentUser();
      }
    },

    updateProfile: async (profileData: Partial<User>): Promise<User> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.user.updateProfile(profileData);
        return response.data;
      } else {
        // In real API, you would call the update profile endpoint
        throw new Error('Update profile not implemented in real API yet');
      }
    },

    uploadAvatar: async (avatarUri: string): Promise<{ avatarUrl: string }> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.user.uploadAvatar(avatarUri);
        return response.data;
      } else {
        // In real API, you would call the upload avatar endpoint
        throw new Error('Upload avatar not implemented in real API yet');
      }
    },
  },

  // Driver onboarding endpoints
  driver: {
    uploadLicense: async (licenseUri: string): Promise<{ licenseUrl: string }> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.driver.uploadLicense(licenseUri);
        return response.data;
      } else {
        // In real API, you would call the upload license endpoint
        throw new Error('Upload license not implemented in real API yet');
      }
    },

    uploadProfilePicture: async (pictureUri: string): Promise<{ pictureUrl: string }> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.driver.uploadProfilePicture(pictureUri);
        return response.data;
      } else {
        // In real API, you would call the upload profile picture endpoint
        throw new Error('Upload profile picture not implemented in real API yet');
      }
    },

    completeOnboarding: async (onboardingData: DriverOnboardingData): Promise<{ isOnboardingComplete: boolean }> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.driver.completeOnboarding(onboardingData);
        return response.data;
      } else {
        // In real API, you would call the complete onboarding endpoint
        throw new Error('Complete onboarding not implemented in real API yet');
      }
    },

    getDriverInfo: async (): Promise<{ hasLicense: boolean; hasProfilePicture: boolean }> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.driver.getDriverInfo();
        return response.data;
      } else {
        // In real API, you would call the get driver info endpoint
        throw new Error('Get driver info not implemented in real API yet');
      }
    },
  },

  // Dashboard endpoints
  dashboard: {
    getStats: async (): Promise<{ totalRides: number; earnings: number; rating: number }> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.dashboard.getStats();
        return response.data;
      } else {
        // In real API, you would call the dashboard stats endpoint
        throw new Error('Get dashboard stats not implemented in real API yet');
      }
    },

    getRecentActivity: async (): Promise<Array<{ id: string; type: string; date: string; amount?: number }>> => {
      if (API_CONFIG.USE_MOCK_API) {
        const response = await mockApi.dashboard.getRecentActivity();
        return response.data;
      } else {
        // In real API, you would call the recent activity endpoint
        throw new Error('Get recent activity not implemented in real API yet');
      }
    },
  },
};

// Export the configuration for easy switching
export { API_CONFIG };
