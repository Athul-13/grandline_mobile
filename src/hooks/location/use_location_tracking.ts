/**
 * Location Tracking Hook
 * Manages location tracking tied to trip lifecycle
 * Automatically starts tracking when trip starts and stops when trip ends
 */

import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { locationTrackingService } from '../../services/location/location_tracking_service';
import { locationSocketService, type LocationUpdatePayload } from '../../services/socket/location_socket_service';
import { getSocketInstance } from '../../services/socket/socket_client';

export interface UseLocationTrackingOptions {
  reservationId: string | null;
  isTripStarted: boolean; // Whether trip has startedAt
  isTripCompleted: boolean; // Whether trip has completedAt
  enabled?: boolean; // Optional override to disable tracking
}

export interface UseLocationTrackingReturn {
  isTracking: boolean;
  hasPermissions: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
}

/**
 * Hook to manage location tracking for active trips
 * 
 * Automatically:
 * - Starts tracking when trip is started (isTripStarted = true)
 * - Stops tracking when trip is completed (isTripCompleted = true)
 * - Handles socket reconnection
 * - Handles app state changes (foreground/background)
 * 
 * @param options Configuration options
 * @returns Location tracking state and controls
 */
export const useLocationTracking = (
  options: UseLocationTrackingOptions
): UseLocationTrackingReturn => {
  const { reservationId, isTripStarted, isTripCompleted, enabled = true } = options;
  const isTrackingRef = useRef(false);
  const hasPermissionsRef = useRef(false);
  const errorRef = useRef<string | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const socketReconnectListenerRef = useRef<(() => void) | null>(null);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const permissions = await locationTrackingService.checkPermissions();
      hasPermissionsRef.current = permissions.foreground;
      
      if (!permissions.foreground && enabled && isTripStarted && !isTripCompleted) {
        errorRef.current = 'Location permission required for trip tracking';
      }
    };

    checkPermissions();
  }, [enabled, isTripStarted, isTripCompleted]);

  // Handle location updates and send via WebSocket
  const handleLocationUpdate = useCallback(
    (location: Location.LocationObject) => {
      if (!reservationId || !isTripStarted || isTripCompleted) {
        return;
      }

      const socket = getSocketInstance();
      if (!socket || !socket.connected) {
        // Socket not connected - location will be sent when socket reconnects
        // We don't queue locations (server is source of truth)
        if (__DEV__) {
          console.warn('[LocationTracking] Socket not connected, skipping location update');
        }
        return;
      }

      // Throttle updates client-side (additional to server throttling)
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      if (timeSinceLastUpdate < 5000) {
        // Skip if less than 5 seconds since last update
        return;
      }

      const payload: LocationUpdatePayload = {
        reservationId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: new Date().toISOString(),
      };

      // Send location update via WebSocket
      const sent = locationSocketService.sendLocationUpdate(
        payload,
        (data) => {
          // Success - location update received by server
          lastUpdateTimeRef.current = Date.now();
          if (__DEV__) {
            console.log('[LocationTracking] Location update confirmed:', data);
          }
        },
        (error) => {
          // Error from server (e.g., throttled, trip ended)
          console.warn('[LocationTracking] Location update error:', error);
          if (error.code === 'TRIP_NOT_STARTED' || error.code === 'TRIP_ALREADY_COMPLETED') {
            // Trip state changed - stop tracking
            locationTrackingService.stopTracking();
            isTrackingRef.current = false;
          }
        }
      );

      if (!sent) {
        if (__DEV__) {
          console.warn('[LocationTracking] Failed to send location update - socket not connected');
        }
      }
    },
    [reservationId, isTripStarted, isTripCompleted]
  );

  // Start/stop tracking based on trip state
  useEffect(() => {
    const manageTracking = async () => {
      // Don't track if disabled, no reservation, or trip completed
      if (!enabled || !reservationId || isTripCompleted) {
        if (isTrackingRef.current) {
          await locationTrackingService.stopTracking();
          isTrackingRef.current = false;
        }
        return;
      }

      // Only track if trip is started
      if (!isTripStarted) {
        if (isTrackingRef.current) {
          await locationTrackingService.stopTracking();
          isTrackingRef.current = false;
        }
        return;
      }

      // Check permissions before starting
      if (!hasPermissionsRef.current) {
        const permissions = await locationTrackingService.checkPermissions();
        hasPermissionsRef.current = permissions.foreground;
        
        if (!permissions.foreground) {
          errorRef.current = 'Location permission required for trip tracking';
          return;
        }
      }

      // Start tracking if not already tracking
      if (!isTrackingRef.current) {
        const started = await locationTrackingService.startTracking(
          reservationId,
          handleLocationUpdate
        );
        
        if (started) {
          isTrackingRef.current = true;
          errorRef.current = null;
        } else {
          errorRef.current = 'Failed to start location tracking';
        }
      }
    };

    manageTracking();
  }, [enabled, reservationId, isTripStarted, isTripCompleted, handleLocationUpdate]);

  // Handle socket reconnection - resume sending location updates
  useEffect(() => {
    const socket = getSocketInstance();
    if (!socket) {
      return;
    }

    const handleReconnect = () => {
      console.log('[LocationTracking] Socket reconnected, location tracking will resume');
      // Location updates will automatically resume via handleLocationUpdate
    };

    socket.on('connect', handleReconnect);
    socketReconnectListenerRef.current = handleReconnect;

    return () => {
      if (socketReconnectListenerRef.current) {
        socket.off('connect', socketReconnectListenerRef.current);
        socketReconnectListenerRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      locationTrackingService.stopTracking();
      isTrackingRef.current = false;
    };
  }, []);

  // Request permissions function
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const granted = await locationTrackingService.requestPermissions();
    if (granted) {
      const permissions = await locationTrackingService.checkPermissions();
      hasPermissionsRef.current = permissions.foreground;
      errorRef.current = null;
    } else {
      errorRef.current = 'Location permission denied';
    }
    return granted;
  }, []);

  return {
    isTracking: isTrackingRef.current,
    hasPermissions: hasPermissionsRef.current,
    error: errorRef.current,
    requestPermissions,
  };
};

