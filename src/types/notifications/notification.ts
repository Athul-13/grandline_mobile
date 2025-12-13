/**
 * Notification types matching server NotificationType enum
 */
export enum NotificationType {
  CHAT_MESSAGE = 'chat_message',
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_MODIFIED = 'reservation_modified',
  RESERVATION_DRIVER_CHANGED = 'reservation_driver_changed',
  RESERVATION_PASSENGERS_ADDED = 'reservation_passengers_added',
  RESERVATION_VEHICLES_ADJUSTED = 'reservation_vehicles_adjusted',
  ITINERARY_UPDATED = 'itinerary_updated',
  RESERVATION_STATUS_CHANGED = 'reservation_status_changed',
  RESERVATION_CHARGE_ADDED = 'reservation_charge_added',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  RESERVATION_REFUNDED = 'reservation_refunded',
  // Driver-specific notification types (to be added to server if not present)
  QUOTE_ASSIGNMENT = 'quote_assignment',
  PAYMENT_UPDATE = 'payment_update',
  ROUTE_CHANGE = 'route_change',
  EMERGENCY_ALERT = 'emergency_alert',
  VEHICLE_UPDATE = 'vehicle_update',
  SYSTEM_ALERT = 'system_alert',
}

/**
 * Notification interface matching server NotificationResponse
 */
export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification list response matching server NotificationListResponse
 */
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  unreadCount: number;
}

/**
 * Unread notification count response matching server UnreadNotificationCountResponse
 */
export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

/**
 * Request parameters for getting notifications
 */
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

/**
 * Mark notification as read response
 */
export interface MarkNotificationAsReadResponse {
  message: string;
  notification: Notification;
}

/**
 * Mark all notifications as read response
 */
export interface MarkAllNotificationsAsReadResponse {
  message: string;
  markedCount: number;
}

