import type { Notification } from './notification';

/**
 * Socket event types for notifications
 */

/**
 * Request to get unread count
 * Client → Server: get-unread-count
 */
export type GetUnreadCountRequest = Record<string, never>;

/**
 * Notification received event
 * Server → Client: notification-received
 */
export type NotificationReceivedEvent = Notification;

/**
 * Unread count updated event
 * Server → Client: unread-count-updated
 */
export interface UnreadCountUpdatedEvent {
  unreadCount: number;
}

/**
 * Socket error event
 * Server → Client: error
 */
export interface SocketError {
  message: string;
  code?: string;
}

