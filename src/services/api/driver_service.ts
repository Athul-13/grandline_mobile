/**
 * Driver API Service
 * Handles driver-specific REST API calls
 */

import { API_ENDPOINTS } from '../../constants/api';
import { grandlineAxiosClient } from './axios_client';

/**
 * Save FCM token request
 */
export interface SaveFcmTokenRequest {
  fcmToken: string;
  deviceId?: string;
  platform: 'ios' | 'android';
}

/**
 * Save FCM token response
 */
export interface SaveFcmTokenResponse {
  message: string;
  success: boolean;
}

/**
 * Driver API Service
 */
export const driverService = {
  /**
   * Save FCM token for push notifications
   */
  async saveFcmToken(request: SaveFcmTokenRequest): Promise<SaveFcmTokenResponse> {
    const response = await grandlineAxiosClient.post<SaveFcmTokenResponse>(
      API_ENDPOINTS.DRIVER.SAVE_FCM_TOKEN,
      request
    );
    return response.data;
  },
};
