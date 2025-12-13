import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Notification } from '../../types/notifications';

/**
 * Storage keys for notifications
 */
const STORAGE_KEYS = {
  NOTIFICATIONS: '@grandline:notifications',
  UNREAD_COUNT: '@grandline:notifications:unread_count',
  LAST_SYNC: '@grandline:notifications:last_sync',
} as const;

/**
 * Notification Storage Service
 * Handles local persistence of notifications using AsyncStorage
 */
export const notificationStorage = {
  /**
   * Save notifications to local storage
   */
  async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('[NotificationStorage] Error saving notifications:', error);
      throw error;
    }
  },

  /**
   * Get notifications from local storage
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) {
        return [];
      }
      const notifications = JSON.parse(data) as Notification[];
      // Convert date strings back to Date objects
      return notifications.map((notification) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
      }));
    } catch (error) {
      console.error('[NotificationStorage] Error getting notifications:', error);
      return [];
    }
  },

  /**
   * Add or update a notification in local storage
   */
  async saveNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const existingIndex = notifications.findIndex(
        (n) => n.notificationId === notification.notificationId
      );

      if (existingIndex >= 0) {
        // Update existing notification
        notifications[existingIndex] = notification;
      } else {
        // Add new notification at the beginning
        notifications.unshift(notification);
      }

      await this.saveNotifications(notifications);
    } catch (error) {
      console.error('[NotificationStorage] Error saving notification:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read in local storage
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const notification = notifications.find((n) => n.notificationId === notificationId);

      if (notification) {
        notification.isRead = true;
        await this.saveNotifications(notifications);
      }
    } catch (error) {
      console.error('[NotificationStorage] Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read in local storage
   */
  async markAllAsRead(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      let markedCount = 0;

      notifications.forEach((notification) => {
        if (!notification.isRead) {
          notification.isRead = true;
          markedCount++;
        }
      });

      if (markedCount > 0) {
        await this.saveNotifications(notifications);
      }

      return markedCount;
    } catch (error) {
      console.error('[NotificationStorage] Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Save unread count to local storage
   */
  async saveUnreadCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, JSON.stringify(count));
    } catch (error) {
      console.error('[NotificationStorage] Error saving unread count:', error);
      throw error;
    }
  },

  /**
   * Get unread count from local storage
   */
  async getUnreadCount(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
      if (!data) {
        return 0;
      }
      return JSON.parse(data) as number;
    } catch (error) {
      console.error('[NotificationStorage] Error getting unread count:', error);
      return 0;
    }
  },

  /**
   * Save last sync timestamp
   */
  async saveLastSync(timestamp: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toISOString());
    } catch (error) {
      console.error('[NotificationStorage] Error saving last sync:', error);
      throw error;
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (!data) {
        return null;
      }
      return new Date(data);
    } catch (error) {
      console.error('[NotificationStorage] Error getting last sync:', error);
      return null;
    }
  },

  /**
   * Clear all notification data from local storage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.NOTIFICATIONS,
        STORAGE_KEYS.UNREAD_COUNT,
        STORAGE_KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('[NotificationStorage] Error clearing notifications:', error);
      throw error;
    }
  },
};

