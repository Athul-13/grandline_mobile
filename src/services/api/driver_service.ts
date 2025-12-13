import { API_ENDPOINTS } from '../../constants/api';
import type { DriverOnboardingData } from '../../types/auth/auth';
import type { Driver } from '../../types/driver';
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
 * Driver Service
 */
export const driverService = {
  /**
   * Get signed upload URL for driver profile picture/license card
   */
  getProfilePictureUploadUrl: async (): Promise<SignedUploadUrlResponse> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DRIVER.PROFILE_PICTURE_UPLOAD_URL
    );
    return unwrapAxiosResponse<SignedUploadUrlResponse>(response);
  },

  updateLicenseCard: async (licenseUrl: string): Promise<{ licenseUrl: string }> => {
    const response = await grandlineAxiosClient.put(
      API_ENDPOINTS.DRIVER.UPDATE_LICENSE_CARD,
      { licenseCardPhotoUrl: licenseUrl }
    );
    const unwrapped = unwrapAxiosResponse<{ driver: { licenseCardPhotoUrl: string } }>(response);
    return { licenseUrl: unwrapped.driver.licenseCardPhotoUrl };
  },

  updateProfilePicture: async (pictureUrl: string): Promise<{ pictureUrl: string }> => {
    const response = await grandlineAxiosClient.put(
      API_ENDPOINTS.DRIVER.UPDATE_PROFILE_PICTURE,
      { profilePictureUrl: pictureUrl }
    );
    const unwrapped = unwrapAxiosResponse<{ driver: { profilePictureUrl: string } }>(response);
    return { pictureUrl: unwrapped.driver.profilePictureUrl };
  },

  /**
   * Uploads license card to Cloudinary and returns the URL (without updating driver record)
   * Used for onboarding flow where completeOnboarding will handle the update
   */
  uploadLicenseCardToCloudinary: async (fileUri: string): Promise<string> => {
    try {
      // Validate file URI
      if (!fileUri || !fileUri.trim()) {
        throw new Error('License card file is required');
      }

      // Step 1: Get signed upload URL from server
      const uploadUrlData = await driverService.getProfilePictureUploadUrl();

      // Step 2: Upload file to Cloudinary
      const uploadedUrl = await uploadFileToCloudinary(
        fileUri,
        uploadUrlData.uploadUrl,
        uploadUrlData.params
      );

      if (!uploadedUrl || !uploadedUrl.trim()) {
        throw new Error('Failed to upload license card: No URL returned from Cloudinary');
      }

      return uploadedUrl;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload license card';
      console.error('Error uploading license card to Cloudinary:', error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Uploads profile picture to Cloudinary and returns the URL (without updating driver record)
   * Used for onboarding flow where completeOnboarding will handle the update
   */
  uploadProfilePictureToCloudinary: async (fileUri: string): Promise<string> => {
    try {
      // Validate file URI
      if (!fileUri || !fileUri.trim()) {
        throw new Error('Profile picture file is required');
      }

      // Step 1: Get signed upload URL from server
      const uploadUrlData = await driverService.getProfilePictureUploadUrl();

      // Step 2: Upload file to Cloudinary
      const uploadedUrl = await uploadFileToCloudinary(
        fileUri,
        uploadUrlData.uploadUrl,
        uploadUrlData.params
      );

      if (!uploadedUrl || !uploadedUrl.trim()) {
        throw new Error('Failed to upload profile picture: No URL returned from Cloudinary');
      }

      return uploadedUrl;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload profile picture';
      console.error('Error uploading profile picture to Cloudinary:', error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Uploads license card to Cloudinary and updates driver record
   * Used for updating license card after onboarding
   */
  uploadLicenseCard: async (fileUri: string): Promise<{ licenseUrl: string }> => {
    let uploadedUrl: string | null = null;
    try {
      // Validate file URI
      if (!fileUri || !fileUri.trim()) {
        throw new Error('License card file is required');
      }

      // Step 1: Get signed upload URL from server
      const uploadUrlData = await driverService.getProfilePictureUploadUrl();

      // Step 2: Upload file to Cloudinary
      uploadedUrl = await uploadFileToCloudinary(
        fileUri,
        uploadUrlData.uploadUrl,
        uploadUrlData.params
      );

      if (!uploadedUrl || !uploadedUrl.trim()) {
        throw new Error('Failed to upload license card: No URL returned from Cloudinary');
      }

      // Step 3: Update driver license card with uploaded URL
      const result = await driverService.updateLicenseCard(uploadedUrl);
      return result;
    } catch (error: any) {
      // If upload succeeded but update failed, the file remains in Cloudinary
      // We can't delete it from mobile app (no API endpoint), but we log it
      if (uploadedUrl) {
        console.warn('License card uploaded to Cloudinary but driver update failed. URL:', uploadedUrl);
      }
      const errorMessage = error?.message || 'Failed to upload license card';
      console.error('Error in uploadLicenseCard:', error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Uploads profile picture to Cloudinary and updates driver record
   * Used for updating profile picture after onboarding
   */
  uploadProfilePicture: async (fileUri: string): Promise<{ pictureUrl: string }> => {
    let uploadedUrl: string | null = null;
    try {
      // Validate file URI
      if (!fileUri || !fileUri.trim()) {
        throw new Error('Profile picture file is required');
      }

      // Step 1: Get signed upload URL from server
      const uploadUrlData = await driverService.getProfilePictureUploadUrl();

      // Step 2: Upload file to Cloudinary
      uploadedUrl = await uploadFileToCloudinary(
        fileUri,
        uploadUrlData.uploadUrl,
        uploadUrlData.params
      );

      if (!uploadedUrl || !uploadedUrl.trim()) {
        throw new Error('Failed to upload profile picture: No URL returned from Cloudinary');
      }

      // Step 3: Update driver profile picture with uploaded URL
      const result = await driverService.updateProfilePicture(uploadedUrl);
      return result;
    } catch (error: any) {
      // If upload succeeded but update failed, the file remains in Cloudinary
      // We can't delete it from mobile app (no API endpoint), but we log it
      if (uploadedUrl) {
        console.warn('Profile picture uploaded to Cloudinary but driver update failed. URL:', uploadedUrl);
      }
      const errorMessage = error?.message || 'Failed to upload profile picture';
      console.error('Error in uploadProfilePicture:', error);
      throw new Error(errorMessage);
    }
  },

  updateOnboardingPassword: async (passwordData: {
    newPassword: string;
  }): Promise<void> => {
    await grandlineAxiosClient.put(
      API_ENDPOINTS.DRIVER.ONBOARDING_PASSWORD,
      passwordData
    );
  },

  completeOnboarding: async (
    onboardingData: DriverOnboardingData
  ): Promise<{ isOnboardingComplete: boolean }> => {
    const response = await grandlineAxiosClient.post(
      API_ENDPOINTS.DRIVER.COMPLETE_ONBOARDING,
      onboardingData
    );
    return unwrapAxiosResponse<{ isOnboardingComplete: boolean }>(response);
  },

  getDriverProfile: async (): Promise<Driver> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DRIVER.GET_DRIVER_PROFILE
    );
    const unwrapped = unwrapAxiosResponse<{ driver: Driver }>(response);
    return unwrapped.driver;
  },

  getDriverInfo: async (): Promise<{ hasLicense: boolean; hasProfilePicture: boolean }> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DRIVER.GET_DRIVER_INFO
    );
    return unwrapAxiosResponse<{ hasLicense: boolean; hasProfilePicture: boolean }>(response);
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await grandlineAxiosClient.post(
      API_ENDPOINTS.DRIVER.CHANGE_PASSWORD,
      passwordData
    );
  },
};

