import { AuthResponse, User, LoginCredentials, PasswordChangeData, DriverOnboardingData } from '../../types/auth';
import { ApiResponse } from '../../constants/api';
import { getMockDelay } from '../../config/apiConfig';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: undefined,
  phoneNumber: '+1234567890',
  isEmailVerified: true,
  isOnboardingComplete: true, // Change this to true/false for testing
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock tokens
const mockTokens = {
  accessToken: 'mock_access_token_12345',
  refreshToken: 'mock_refresh_token_67890',
  expiresIn: 3600, // 1 hour
};

// Simulate network delay
const simulateDelay = (ms?: number) => 
  new Promise(resolve => setTimeout(resolve, ms || getMockDelay()));

// Mock API responses
export const mockApi = {
  // Authentication endpoints
  auth: {
    login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
      await simulateDelay(1500); // Simulate network delay
      
      // Simulate login validation
      if (credentials.email === 'test@test.com' && credentials.password === 'password') {
        return {
          success: true,
          data: {
            user: mockUser,
            accessToken: mockTokens.accessToken,
            refreshToken: mockTokens.refreshToken,
            expiresIn: mockTokens.expiresIn,
          },
          message: 'Login successful',
        };
      } else {
        throw new Error('Invalid credentials. Please try again.');
      }
    },

    logout: async (): Promise<ApiResponse<null>> => {
      await simulateDelay(500);
      return {
        success: true,
        data: null,
        message: 'Logout successful',
      };
    },

    changePassword: async (passwordData: PasswordChangeData): Promise<ApiResponse<null>> => {
      await simulateDelay(1200);
      
      // Simulate password validation
      if (passwordData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      return {
        success: true,
        data: null,
        message: 'Password changed successfully',
      };
    },

    refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
      await simulateDelay(800);
      return {
        success: true,
        data: {
          user: mockUser,
          accessToken: `new_${mockTokens.accessToken}`,
          refreshToken: `new_${mockTokens.refreshToken}`,
          expiresIn: mockTokens.expiresIn,
        },
        message: 'Token refreshed successfully',
      };
    },

    forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
      await simulateDelay(1000);
      return {
        success: true,
        data: null,
        message: 'Password reset email sent',
      };
    },

    resetPassword: async (resetData: { token: string; newPassword: string }): Promise<ApiResponse<null>> => {
      await simulateDelay(1000);
      return {
        success: true,
        data: null,
        message: 'Password reset successfully',
      };
    },

    verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
      await simulateDelay(800);
      return {
        success: true,
        data: null,
        message: 'Email verified successfully',
      };
    },
  },

  // User endpoints
  user: {
    getProfile: async (): Promise<ApiResponse<User>> => {
      await simulateDelay(600);
      return {
        success: true,
        data: mockUser,
        message: 'Profile retrieved successfully',
      };
    },

    updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<User>> => {
      await simulateDelay(1000);
      const updatedUser = { ...mockUser, ...profileData, updatedAt: new Date().toISOString() };
      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      };
    },

    uploadAvatar: async (avatarUri: string): Promise<ApiResponse<{ avatarUrl: string }>> => {
      await simulateDelay(1500);
      return {
        success: true,
        data: { avatarUrl: avatarUri },
        message: 'Avatar uploaded successfully',
      };
    },
  },

  // Driver onboarding endpoints
  driver: {
    uploadLicense: async (licenseUri: string): Promise<ApiResponse<{ licenseUrl: string }>> => {
      await simulateDelay(2000);
      return {
        success: true,
        data: { licenseUrl: licenseUri },
        message: 'Driver license uploaded successfully',
      };
    },

    uploadProfilePicture: async (pictureUri: string): Promise<ApiResponse<{ pictureUrl: string }>> => {
      await simulateDelay(2000);
      return {
        success: true,
        data: { pictureUrl: pictureUri },
        message: 'Profile picture uploaded successfully',
      };
    },

    completeOnboarding: async (onboardingData: DriverOnboardingData): Promise<ApiResponse<{ isOnboardingComplete: boolean }>> => {
      await simulateDelay(2500);
      return {
        success: true,
        data: { isOnboardingComplete: true },
        message: 'Driver onboarding completed successfully',
      };
    },

    getDriverInfo: async (): Promise<ApiResponse<{ hasLicense: boolean; hasProfilePicture: boolean }>> => {
      await simulateDelay(600);
      return {
        success: true,
        data: { hasLicense: true, hasProfilePicture: true },
        message: 'Driver info retrieved successfully',
      };
    },
  },

  // Dashboard endpoints
  dashboard: {
    getStats: async (): Promise<ApiResponse<{ totalRides: number; earnings: number; rating: number }>> => {
      await simulateDelay(800);
      return {
        success: true,
        data: { totalRides: 25, earnings: 1250.50, rating: 4.8 },
        message: 'Dashboard stats retrieved successfully',
      };
    },

    getRecentActivity: async (): Promise<ApiResponse<{ id: string; type: string; date: string; amount?: number }[]>> => {
      await simulateDelay(600);
      return {
        success: true,
        data: [
          { id: '1', type: 'ride', date: '2024-01-15T10:30:00Z', amount: 25.50 },
          { id: '2', type: 'ride', date: '2024-01-14T15:45:00Z', amount: 18.75 },
          { id: '3', type: 'bonus', date: '2024-01-13T09:00:00Z', amount: 50.00 },
        ],
        message: 'Recent activity retrieved successfully',
      };
    },
  },
};

