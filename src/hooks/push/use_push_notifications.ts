/**
 * Push Notifications Hook
 * Initializes and manages push notifications
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../contexts/notification_context';
import { pushNotificationService } from '../../services/push/push_notification_service';
import type { RootState } from '../../store/store';
import { useAppState } from '../app/use_app_state';

/**
 * Hook to initialize and manage push notifications
 */
export const usePushNotifications = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isActive } = useAppState();
  const { refreshNotifications } = useNotifications();
  const listenersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Register push token with server
    const registerToken = async () => {
      try {
        await pushNotificationService.registerToken();
      } catch (error) {
        console.error('[usePushNotifications] Error registering token:', error);
      }
    };

    registerToken();

    // Set up notification listeners
    const cleanup = pushNotificationService.setupNotificationListeners(
      // Handle notification received in foreground
      async (notification) => {
        console.log('[usePushNotifications] Notification received:', notification);
        
        // If app is active, refresh notifications to show in-app
        // Don't show system notification if app is in foreground
        if (isActive) {
          await refreshNotifications();
        }
      },
      // Handle notification tap
      (response) => {
        console.log('[usePushNotifications] Notification tapped:', response);
        const data = response.notification.request.content.data;

        // Navigate based on notification data
        if (data && typeof data === 'object' && 'type' in data && 'chatId' in data) {
          if (data.type === 'chat_message' && typeof data.chatId === 'string') {
            router.push({
              pathname: '/(main)/chat/chat-detail',
              params: { chatId: data.chatId },
            });
          } else if (data.type === 'notification') {
            router.push('/(main)/(settings)/notifications');
          }
        }
      }
    );

    if (cleanup) {
      listenersRef.current.push(cleanup);
    }

    // Check if app was opened from a notification
    const checkInitialNotification = async () => {
      const response = await pushNotificationService.getLastNotificationResponse();
      if (response) {
        const data = response.notification.request.content.data;
        if (data && typeof data === 'object' && 'type' in data && 'chatId' in data) {
          if (data.type === 'chat_message' && typeof data.chatId === 'string') {
            router.push({
              pathname: '/(main)/chat/chat-detail',
              params: { chatId: data.chatId },
            });
          } else if (data.type === 'notification') {
            router.push('/(main)/(settings)/notifications');
          }
        }
      }
    };

    checkInitialNotification();

    // Update badge count when unread count changes
    const updateBadge = async () => {
      if (Platform.OS === 'ios') {
        // Badge count will be updated by notification context
      }
    };

    updateBadge();

    // Cleanup
    return () => {
      listenersRef.current.forEach((cleanup) => cleanup());
      listenersRef.current = [];
    };
  }, [isAuthenticated, isActive, refreshNotifications, router]);
};

