/**
 * Notification Socket Service
 * Handles notification-related Socket.io events for mobile app
 */

import type {
    GetUnreadCountRequest,
    NotificationReceivedEvent,
    SocketError,
    UnreadCountUpdatedEvent,
} from '../../types/notifications/notification_socket_events';
import { getSocketInstance } from './socket_client';

/**
 * Socket event names for notifications (matching server)
 */
export const NOTIFICATION_SOCKET_EVENTS = {
  // Client -> Server
  GET_UNREAD_COUNT: 'get-unread-count',
  // Server -> Client
  NOTIFICATION_RECEIVED: 'notification-received',
  UNREAD_COUNT_UPDATED: 'unread-count-updated',
  ERROR: 'error',
} as const;

/**
 * Notification Socket Service
 * Provides methods for notification-related socket operations
 */
export const notificationSocketService = {
  /**
   * Request unread notification count
   * Client → Server: get-unread-count
   * Server → Client: unread-count-updated
   */
  getUnreadCount: (
    onUpdated?: (data: UnreadCountUpdatedEvent) => void,
    onError?: (error: SocketError) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[NotificationSocketService] Socket not available');
      onError?.({ message: 'Socket not connected', code: 'NOT_CONNECTED' });
      return null;
    }

    const handleUpdated = (data: UnreadCountUpdatedEvent) => {
      socket.off(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, handleUpdated);
      socket.off(NOTIFICATION_SOCKET_EVENTS.ERROR, handleError);
      onUpdated?.(data);
    };

    const handleError = (error: SocketError) => {
      socket.off(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, handleUpdated);
      socket.off(NOTIFICATION_SOCKET_EVENTS.ERROR, handleError);
      onError?.(error);
    };

    socket.once(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, handleUpdated);
    socket.once(NOTIFICATION_SOCKET_EVENTS.ERROR, handleError);

    socket.emit(NOTIFICATION_SOCKET_EVENTS.GET_UNREAD_COUNT, {} as GetUnreadCountRequest);

    // Return cleanup function
    return () => {
      socket.off(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, handleUpdated);
      socket.off(NOTIFICATION_SOCKET_EVENTS.ERROR, handleError);
    };
  },

  /**
   * Listen for new notifications
   * Server → Client: notification-received
   */
  onNotificationReceived: (
    callback: (notification: NotificationReceivedEvent) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[NotificationSocketService] Socket not available');
      return null;
    }

    socket.on(NOTIFICATION_SOCKET_EVENTS.NOTIFICATION_RECEIVED, callback);
    return () => socket.off(NOTIFICATION_SOCKET_EVENTS.NOTIFICATION_RECEIVED, callback);
  },

  /**
   * Listen for unread count updates
   * Server → Client: unread-count-updated
   */
  onUnreadCountUpdated: (
    callback: (data: UnreadCountUpdatedEvent) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[NotificationSocketService] Socket not available');
      return null;
    }

    socket.on(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, callback);
    return () => socket.off(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, callback);
  },

  /**
   * Listen for socket errors
   * Server → Client: error
   */
  onError: (callback: (error: SocketError) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[NotificationSocketService] Socket not available');
      return null;
    }

    socket.on(NOTIFICATION_SOCKET_EVENTS.ERROR, callback);
    return () => socket.off(NOTIFICATION_SOCKET_EVENTS.ERROR, callback);
  },
};

