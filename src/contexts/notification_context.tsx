import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSocketConnection } from '../hooks/socket/use_socket_connection';
import { notificationService } from '../services/api/notification_service';
import { notificationSocketService } from '../services/socket/notification_socket_service';
import { notificationStorage } from '../services/storage/notification_storage';
import type { Notification } from '../types/notifications';

/**
 * Notification context state
 */
interface NotificationContextState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
}

/**
 * Notification Context
 */
const NotificationContext = createContext<NotificationContextState | undefined>(undefined);

/**
 * Notification Provider Props
 */
interface NotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Notification Provider
 * Manages notification state, socket integration, and local storage
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useSocketConnection();
  const socketListenersRef = useRef<(() => void)[]>([]);

  /**
   * Refresh notifications from server
   */
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications({ page: 1, limit: 50 });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);

      // Save to storage
      await notificationStorage.saveNotifications(response.notifications);
      await notificationStorage.saveUnreadCount(response.unreadCount);
      await notificationStorage.saveLastSync(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('[NotificationContext] Error refreshing notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load notifications from storage on mount
   */
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const storedNotifications = await notificationStorage.getNotifications();
        const storedUnreadCount = await notificationStorage.getUnreadCount();
        setNotifications(storedNotifications);
        setUnreadCount(storedUnreadCount);
      } catch (err) {
        console.error('[NotificationContext] Error loading from storage:', err);
      }
    };

    loadFromStorage();
  }, []);

  /**
   * Set up socket listeners when connected and sync on startup
   */
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // Sync with server on socket connection (startup or reconnection)
    const syncOnConnection = async () => {
      try {
        // Refresh notifications from server
        await refreshNotifications();
        console.log('[NotificationContext] Synced notifications on socket connection');
      } catch (err) {
        console.error('[NotificationContext] Error syncing notifications:', err);
      }
    };

    syncOnConnection();

    // Request unread count on connection
    const cleanupGetUnread = notificationSocketService.getUnreadCount(
      (data) => {
        setUnreadCount(data.unreadCount);
        notificationStorage.saveUnreadCount(data.unreadCount).catch(console.error);
      },
      (err) => {
        console.error('[NotificationContext] Error getting unread count:', err);
      }
    );

    if (cleanupGetUnread) {
      socketListenersRef.current.push(cleanupGetUnread);
    }

    // Listen for new notifications
    const cleanupNotificationReceived = notificationSocketService.onNotificationReceived(
      (notification) => {
        console.log('[NotificationContext] New notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          // Save to storage with updated count
          notificationStorage.saveUnreadCount(newCount).catch(console.error);
          return newCount;
        });
        
        // Save notification to storage
        notificationStorage.saveNotification(notification).catch(console.error);
      }
    );

    if (cleanupNotificationReceived) {
      socketListenersRef.current.push(cleanupNotificationReceived);
    }

    // Listen for unread count updates
    const cleanupUnreadCountUpdated = notificationSocketService.onUnreadCountUpdated(
      (data) => {
        console.log('[NotificationContext] Unread count updated:', data.unreadCount);
        setUnreadCount(data.unreadCount);
        notificationStorage.saveUnreadCount(data.unreadCount).catch(console.error);
      }
    );

    if (cleanupUnreadCountUpdated) {
      socketListenersRef.current.push(cleanupUnreadCountUpdated);
    }

    // Cleanup on unmount or disconnect
    return () => {
      socketListenersRef.current.forEach((cleanup) => cleanup());
      socketListenersRef.current = [];
    };
  }, [isConnected, refreshNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Update storage
      await notificationStorage.markAsRead(notificationId);
      await notificationStorage.saveUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('[NotificationContext] Error marking notification as read:', err);
      throw err;
    }
  }, [unreadCount]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Update storage
      await notificationStorage.markAllAsRead();
      await notificationStorage.saveUnreadCount(0);
    } catch (err) {
      console.error('[NotificationContext] Error marking all as read:', err);
      throw err;
    }
  }, []);

  /**
   * Get unread count from server
   */
  const getUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount);
      await notificationStorage.saveUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('[NotificationContext] Error getting unread count:', err);
    }
  }, []);

  const value: NotificationContextState = {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

/**
 * Hook to use notification context
 */
export const useNotifications = (): NotificationContextState => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

