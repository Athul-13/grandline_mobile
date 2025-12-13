import { API_ENDPOINTS } from '../../constants/api';
import type { DriverOnboardingData } from '../../types/auth/auth';
import type { Driver } from '../../types/driver';
import { uploadFileToCloudinary } from '../../utils/cloudinary_uploader';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';
import { grandlineAxiosClient } from './axios_client';
import { userService } from './user_service';

/**
 * Driver Service
 */
export const driverService = {
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

  uploadLicenseCard: async (fileUri: string): Promise<{ licenseUrl: string }> => {
    // Step 1: Get signed upload URL (reuse user endpoint for now, or create driver-specific endpoint)
    // TODO: Server should add /driver/license/upload-url endpoint
    const uploadUrlData = await userService.getProfilePictureUploadUrl();

    // Step 2: Upload file to Cloudinary
    const uploadedUrl = await uploadFileToCloudinary(
      fileUri,
      uploadUrlData.uploadUrl,
      uploadUrlData.params
    );

    // Step 3: Update driver license card with uploaded URL
    return await driverService.updateLicenseCard(uploadedUrl);
  },

  uploadProfilePicture: async (fileUri: string): Promise<{ pictureUrl: string }> => {
    // Step 1: Get signed upload URL (reuse user endpoint for now, or create driver-specific endpoint)
    // TODO: Server should add /driver/profile-picture/upload-url endpoint
    const uploadUrlData = await userService.getProfilePictureUploadUrl();

    // Step 2: Upload file to Cloudinary
    const uploadedUrl = await uploadFileToCloudinary(
      fileUri,
      uploadUrlData.uploadUrl,
      uploadUrlData.params
    );

    // Step 3: Update driver profile picture with uploaded URL
    return await driverService.updateProfilePicture(uploadedUrl);
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

