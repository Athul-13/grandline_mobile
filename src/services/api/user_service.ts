import { API_ENDPOINTS } from '../../constants/api';
import type { User } from '../../types/auth/user';
import { grandlineAxiosClient } from './axios_client';

/**
 * User Service
 */
export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await grandlineAxiosClient.get<User>(
      API_ENDPOINTS.USER.PROFILE
    );
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await grandlineAxiosClient.patch<User>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      profileData
    );
    return response.data;
  },

  getProfilePictureUploadUrl: async (): Promise<{ uploadUrl: string }> => {
    const response = await grandlineAxiosClient.get<{ uploadUrl: string }>(
      API_ENDPOINTS.USER.PROFILE_PICTURE_UPLOAD_URL
    );
    return response.data;
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
  },
};

