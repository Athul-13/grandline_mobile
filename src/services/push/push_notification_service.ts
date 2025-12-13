/**
 * Push Notification Service
 * Handles push notifications using Expo Notifications
 * Integrates with FCM for backend delivery
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { driverService } from '../api/driver_service';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Push Notification Service
 * Manages push notification setup, permissions, and handling
 */
export const pushNotificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('[PushNotification] Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[PushNotification] Permission not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('[PushNotification] Error requesting permissions:', error);
      return false;
    }
  },

  /**
   * Get Expo push token (this is what we send to server)
   * Server will use this to send notifications via Expo Push Notification service
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('[PushNotification] Must use physical device for push notifications');
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      return tokenData.data;
    } catch (error) {
      console.error('[PushNotification] Error getting Expo push token:', error);
      return null;
    }
  },

  /**
   * Register push token with server
   */
  async registerToken(): Promise<boolean> {
    try {
      const token = await this.getExpoPushToken();
      if (!token) {
        return false;
      }

      const deviceId = Device.modelName || 'unknown';
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      await driverService.saveFcmToken({
        fcmToken: token, // Expo push token (server will handle conversion if needed)
        deviceId,
        platform,
      });

      console.log('[PushNotification] Token registered with server');
      return true;
    } catch (error) {
      console.error('[PushNotification] Error registering token:', error);
      return false;
    }
  },

  /**
   * Set up notification listeners
   * Returns cleanup function
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): (() => void) | null {
    // Listener for notifications received while app is in foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('[PushNotification] Notification received (foreground):', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listener for when user taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('[PushNotification] Notification tapped:', response);
        onNotificationTapped?.(response);
      }
    );

    // Return cleanup function
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  },

  /**
   * Get last notification response (when app opened from notification)
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch (error) {
      console.error('[PushNotification] Error getting last notification:', error);
      return null;
    }
  },

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Set badge count (iOS)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  },
};

