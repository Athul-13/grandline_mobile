/**
 * Location Socket Service
 * Handles location update socket events for mobile app
 */

import type { Socket } from 'socket.io-client';
import { getSocketInstance } from './socket_client';

/**
 * Socket event names for location updates (matching server)
 */
export const LOCATION_SOCKET_EVENTS = {
  // Client -> Server
  LOCATION_UPDATE: 'location:update',
  // Server -> Client
  LOCATION_UPDATE_RECEIVED: 'location:update-received',
  ERROR: 'error',
} as const;

export interface LocationUpdatePayload {
  reservationId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: string; // ISO string from client (optional, server will override)
}

export interface LocationUpdateReceivedEvent {
  reservationId: string;
  timestamp: string;
}

export interface SocketError {
  message: string;
  code: string;
  reservationId?: string;
}

/**
 * Location Socket Service
 * Provides methods for location-related socket operations
 */
export const locationSocketService = {
  /**
   * Send location update to server
   * Client → Server: location:update
   * Server → Client: location:update-received (confirmation)
   */
  sendLocationUpdate: (
    payload: LocationUpdatePayload,
    onReceived?: (data: LocationUpdateReceivedEvent) => void,
    onError?: (error: SocketError) => void
  ): boolean => {
    const socket = getSocketInstance();
    if (!socket || !socket.connected) {
      console.warn('[LocationSocketService] Socket not available or not connected');
      onError?.({ message: 'Socket not connected', code: 'NOT_CONNECTED', reservationId: payload.reservationId });
      return false;
    }

    // Set up one-time listeners for response
    const handleReceived = (data: LocationUpdateReceivedEvent) => {
      if (data.reservationId === payload.reservationId) {
        socket.off(LOCATION_SOCKET_EVENTS.LOCATION_UPDATE_RECEIVED, handleReceived);
        socket.off(LOCATION_SOCKET_EVENTS.ERROR, handleError);
        onReceived?.(data);
      }
    };

    const handleError = (error: SocketError) => {
      if (!error.reservationId || error.reservationId === payload.reservationId) {
        socket.off(LOCATION_SOCKET_EVENTS.LOCATION_UPDATE_RECEIVED, handleReceived);
        socket.off(LOCATION_SOCKET_EVENTS.ERROR, handleError);
        onError?.(error);
      }
    };

    socket.on(LOCATION_SOCKET_EVENTS.LOCATION_UPDATE_RECEIVED, handleReceived);
    socket.on(LOCATION_SOCKET_EVENTS.ERROR, handleError);

    // Send location update
    socket.emit(LOCATION_SOCKET_EVENTS.LOCATION_UPDATE, payload);

    return true;
  },
};

