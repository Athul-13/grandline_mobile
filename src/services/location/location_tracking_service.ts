/**
 * Location Tracking Service
 * Manages location tracking using expo-location
 * Handles foreground and background tracking with battery-efficient configuration
 */

import * as Location from 'expo-location';
import { Platform } from 'react-native';

/**
 * Location tracking configuration
 * Balanced accuracy (Uber-like) for battery efficiency
 */
const LOCATION_CONFIG = {
  accuracy: Location.Accuracy.Balanced, // Balanced accuracy (not highest for battery)
  timeInterval: 5000, // 5 seconds minimum (matches server throttling)
  distanceInterval: 10, // 10 meters minimum movement
  foregroundService: {
    notificationTitle: 'GrandLine Driver',
    notificationBody: 'Tracking your location during active trip',
    notificationColor: '#C5630C',
  },
} as const;

/**
 * Location tracking state
 */
let isTracking = false;
let locationSubscription: Location.LocationSubscription | null = null;
let currentReservationId: string | null = null;
let onLocationUpdate: ((location: Location.LocationObject) => void) | null = null;

/**
 * Location Tracking Service
 */
export const locationTrackingService = {
  /**
   * Request location permissions
   * Returns true if permissions granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.warn('[LocationTracking] Foreground location permission denied');
        return false;
      }

      // Request background permission (required for background tracking)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('[LocationTracking] Background location permission denied');
        // Still allow foreground tracking
        return true;
      }

      console.log('[LocationTracking] Location permissions granted');
      return true;
    } catch (error) {
      console.error('[LocationTracking] Error requesting permissions:', error);
      return false;
    }
  },

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    try {
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      
      return {
        foreground: foregroundStatus.granted,
        background: backgroundStatus.granted,
      };
    } catch (error) {
      console.error('[LocationTracking] Error checking permissions:', error);
      return { foreground: false, background: false };
    }
  },

  /**
   * Start location tracking for a reservation
   * Only starts if not already tracking
   */
  async startTracking(
    reservationId: string,
    onUpdate: (location: Location.LocationObject) => void
  ): Promise<boolean> {
    if (isTracking) {
      console.warn('[LocationTracking] Already tracking location');
      return false;
    }

    // Check permissions
    const permissions = await this.checkPermissions();
    if (!permissions.foreground) {
      console.error('[LocationTracking] Foreground location permission not granted');
      return false;
    }

    try {
      // Configure location options
      // watchPositionAsync works in both foreground and background (when app is still running)
      // It stops when app is killed (as per requirements)
      const locationOptions: Location.LocationOptions = {
        accuracy: LOCATION_CONFIG.accuracy,
        timeInterval: LOCATION_CONFIG.timeInterval,
        distanceInterval: LOCATION_CONFIG.distanceInterval,
      };

      // Start location updates
      // This will work in foreground and continue in background if permissions are granted
      // Stops automatically when app is killed (no background task needed)
      locationSubscription = await Location.watchPositionAsync(
        locationOptions,
        (location) => {
          onUpdate(location);
        }
      );

      isTracking = true;
      currentReservationId = reservationId;
      onLocationUpdate = onUpdate;

      console.log(`[LocationTracking] Started tracking for reservation: ${reservationId}`);
      return true;
    } catch (error) {
      console.error('[LocationTracking] Error starting location tracking:', error);
      isTracking = false;
      currentReservationId = null;
      onLocationUpdate = null;
      return false;
    }
  },

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    if (!isTracking) {
      return;
    }

    try {
      if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
      }

      isTracking = false;
      const reservationId = currentReservationId;
      currentReservationId = null;
      onLocationUpdate = null;

      console.log(`[LocationTracking] Stopped tracking for reservation: ${reservationId}`);
    } catch (error) {
      console.error('[LocationTracking] Error stopping location tracking:', error);
    }
  },

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return isTracking;
  },

  /**
   * Get current reservation ID being tracked
   */
  getCurrentReservationId(): string | null {
    return currentReservationId;
  },
};

