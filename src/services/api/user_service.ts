import { API_ENDPOINTS } from '../../constants/api';
import type { User } from '../../types/auth/user';
import { uploadFileToCloudinary } from '../../utils/cloudinary_uploader';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';
import { grandlineAxiosClient } from './axios_client';

/**
 * Signed upload URL response from server
 */
interface SignedUploadUrlResponse {
  uploadUrl: string;
  params: {
    timestamp: number;
    signature: string;
    api_key: string;
    folder: string;
  };
  expiresIn: number;
}

/**
 * User Service
 */
export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.USER.PROFILE
    );
    return unwrapAxiosResponse<User>(response);
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await grandlineAxiosClient.patch(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      profileData
    );
    return unwrapAxiosResponse<User>(response);
  },

  getProfilePictureUploadUrl: async (): Promise<SignedUploadUrlResponse> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.USER.PROFILE_PICTURE_UPLOAD_URL
    );
    return unwrapAxiosResponse<SignedUploadUrlResponse>(response);
  },

  uploadProfilePicture: async (fileUri: string): Promise<{ profilePictureUrl: string }> => {
    // Step 1: Get signed upload URL from server
    const uploadUrlData = await userService.getProfilePictureUploadUrl();

    // Step 2: Upload file to Cloudinary using signed URL
    const uploadedUrl = await uploadFileToCloudinary(
      fileUri,
      uploadUrlData.uploadUrl,
      uploadUrlData.params
    );

    // Step 3: Return the uploaded URL
    // Note: Server may need to be updated to accept this URL and update user profile
    // For now, return the URL - the caller can use it to update profile if needed
    return { profilePictureUrl: uploadedUrl };
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await grandlineAxiosClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
  },
};

