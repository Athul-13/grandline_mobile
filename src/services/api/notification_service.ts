import { API_ENDPOINTS } from '../../constants/api';
import type {
    GetNotificationsParams,
    MarkAllNotificationsAsReadResponse,
    MarkNotificationAsReadResponse,
    NotificationListResponse,
    UnreadNotificationCountResponse,
} from '../../types/notifications';
import grandlineAxiosClient from './axios_client';

/**
 * Notification API Service
 * Handles all REST API calls related to notifications
 */
export const notificationService = {
  /**
   * Get all notifications for the authenticated user with pagination
   */
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationListResponse> {
    const response = await grandlineAxiosClient.get<NotificationListResponse>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      {
        params: {
          page: params?.page,
          limit: params?.limit,
          unreadOnly: params?.unreadOnly,
          type: params?.type,
        },
      }
    );
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<MarkNotificationAsReadResponse> {
    const response = await grandlineAxiosClient.post<MarkNotificationAsReadResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)
    );
    return response.data;
  },

  /**
   * Mark all notifications as read for the authenticated user
   */
  async markAllNotificationsAsRead(): Promise<MarkAllNotificationsAsReadResponse> {
    const response = await grandlineAxiosClient.post<MarkAllNotificationsAsReadResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return response.data;
  },

  /**
   * Get unread notification count for the authenticated user
   */
  async getUnreadCount(): Promise<UnreadNotificationCountResponse> {
    const response = await grandlineAxiosClient.get<UnreadNotificationCountResponse>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data;
  },
};

