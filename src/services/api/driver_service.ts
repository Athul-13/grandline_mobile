import { API_ENDPOINTS } from '../../constants/api';
import type { DriverOnboardingData } from '../../types/auth/auth';
import { grandlineAxiosClient } from './axios_client';

/**
 * Driver Service
 */
export const driverService = {
  updateLicenseCard: async (licenseUrl: string): Promise<{ licenseUrl: string }> => {
    const response = await grandlineAxiosClient.put<{ licenseUrl: string }>(
      API_ENDPOINTS.DRIVER.UPDATE_LICENSE_CARD,
      { licenseUrl }
    );
    return response.data;
  },

  updateProfilePicture: async (pictureUrl: string): Promise<{ pictureUrl: string }> => {
    const response = await grandlineAxiosClient.put<{ pictureUrl: string }>(
      API_ENDPOINTS.DRIVER.UPDATE_PROFILE_PICTURE,
      { pictureUrl }
    );
    return response.data;
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
    const response = await grandlineAxiosClient.post<{ isOnboardingComplete: boolean }>(
      API_ENDPOINTS.DRIVER.COMPLETE_ONBOARDING,
      onboardingData
    );
    return response.data;
  },

  getDriverProfile: async (): Promise<any> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DRIVER.GET_DRIVER_PROFILE
    );
    return response.data;
  },

  getDriverInfo: async (): Promise<{ hasLicense: boolean; hasProfilePicture: boolean }> => {
    const response = await grandlineAxiosClient.get<{
      hasLicense: boolean;
      hasProfilePicture: boolean;
    }>(API_ENDPOINTS.DRIVER.GET_DRIVER_INFO);
    return response.data;
  },
};

