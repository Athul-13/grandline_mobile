import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AUTH_STORAGE_KEYS } from '../../constants/storage';
import type { Driver } from '../../types/driver';

/**
 * Auth Storage Service
 * Handles secure storage of authentication tokens and driver profile
 * Uses expo-secure-store for tokens (sensitive) and AsyncStorage for driver profile (non-sensitive)
 */
export const authStorage = {
  /**
   * Save authentication data to secure storage
   */
  async saveAuthData(data: {
    accessToken: string;
    refreshToken: string;
    driver: Driver;
  }): Promise<void> {
    try {
      // Store tokens in secure storage
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      
      // Store driver profile in AsyncStorage (non-sensitive data)
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.DRIVER_PROFILE, JSON.stringify(data.driver));
    } catch (error) {
      console.error('[AuthStorage] Error saving auth data:', error);
      throw error;
    }
  },

  /**
   * Load authentication data from storage
   */
  async loadAuthData(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    driver: Driver | null;
  }> {
    try {
      const [accessToken, refreshToken, driverData] = await Promise.all([
        SecureStore.getItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(AUTH_STORAGE_KEYS.DRIVER_PROFILE),
      ]);

      let driver: Driver | null = null;
      if (driverData) {
        try {
          driver = JSON.parse(driverData) as Driver;
        } catch (parseError) {
          console.error('[AuthStorage] Error parsing driver data:', parseError);
        }
      }

      return {
        accessToken,
        refreshToken,
        driver,
      };
    } catch (error) {
      console.error('[AuthStorage] Error loading auth data:', error);
      return {
        accessToken: null,
        refreshToken: null,
        driver: null,
      };
    }
  },

  /**
   * Update access token (after refresh)
   */
  async updateAccessToken(accessToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    } catch (error) {
      console.error('[AuthStorage] Error updating access token:', error);
      throw error;
    }
  },

  /**
   * Update tokens (after refresh)
   */
  async updateTokens(data: {
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    } catch (error) {
      console.error('[AuthStorage] Error updating tokens:', error);
      throw error;
    }
  },

  /**
   * Clear all authentication data from storage
   */
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(AUTH_STORAGE_KEYS.DRIVER_PROFILE),
      ]);
    } catch (error) {
      console.error('[AuthStorage] Error clearing auth data:', error);
      // Continue even if some deletions fail
    }
  },

  /**
   * Get access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('[AuthStorage] Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token from storage
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('[AuthStorage] Error getting refresh token:', error);
      return null;
    }
  },
};

