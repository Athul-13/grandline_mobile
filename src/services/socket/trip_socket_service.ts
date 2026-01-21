/**
 * Trip Socket Service
 * Handles trip-related Socket.io events for mobile app (driver changes, vehicle changes)
 */

import type {
  TripDriverChangedEvent,
  TripVehicleChangedEvent,
} from '../../types/driver/trip_socket_events';
import { getSocketInstance } from './socket_client';

/**
 * Socket event names for trip events (matching server)
 */
export const TRIP_SOCKET_EVENTS = {
  // Server -> Client
  TRIP_DRIVER_CHANGED: 'trip:driver_changed',
  TRIP_VEHICLE_CHANGED: 'trip:vehicle_changed',
} as const;

/**
 * Trip Socket Service
 * Provides methods for trip-related socket operations
 */
export const tripSocketService = {
  /**
   * Listen for driver changed events
   * Server → Client: trip:driver_changed
   * 
   * @param callback Callback function to handle driver changed events
   * @returns Cleanup function to remove listener, or null if socket not available
   */
  onDriverChanged: (
    callback: (event: TripDriverChangedEvent) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[TripSocketService] Socket not available');
      return null;
    }

    socket.on(TRIP_SOCKET_EVENTS.TRIP_DRIVER_CHANGED, callback);
    return () => socket.off(TRIP_SOCKET_EVENTS.TRIP_DRIVER_CHANGED, callback);
  },

  /**
   * Listen for vehicle changed events
   * Server → Client: trip:vehicle_changed
   * 
   * @param callback Callback function to handle vehicle changed events
   * @returns Cleanup function to remove listener, or null if socket not available
   */
  onVehicleChanged: (
    callback: (event: TripVehicleChangedEvent) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[TripSocketService] Socket not available');
      return null;
    }

    socket.on(TRIP_SOCKET_EVENTS.TRIP_VEHICLE_CHANGED, callback);
    return () => socket.off(TRIP_SOCKET_EVENTS.TRIP_VEHICLE_CHANGED, callback);
  },
};

