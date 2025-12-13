/**
 * Push Notification Service
 * Handles push notifications using Expo Notifications
 * Integrates with FCM for backend delivery
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_BEHAVIOR, PUSH_NOTIFICATION_CHANNEL } from '../../constants/push';
import { driverService } from '../api/driver_service';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: NOTIFICATION_BEHAVIOR.SHOULD_SHOW_ALERT,
    shouldPlaySound: NOTIFICATION_BEHAVIOR.SHOULD_PLAY_SOUND,
    shouldSetBadge: NOTIFICATION_BEHAVIOR.SHOULD_SET_BADGE,
    shouldShowBanner: NOTIFICATION_BEHAVIOR.SHOULD_SHOW_BANNER,
    shouldShowList: NOTIFICATION_BEHAVIOR.SHOULD_SHOW_LIST,
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
        await Notifications.setNotificationChannelAsync(PUSH_NOTIFICATION_CHANNEL.ID, {
          name: PUSH_NOTIFICATION_CHANNEL.NAME,
          importance: Notifications.AndroidImportance[PUSH_NOTIFICATION_CHANNEL.IMPORTANCE],
          vibrationPattern: [0, 250, 250, 250],
          lightColor: PUSH_NOTIFICATION_CHANNEL.LIGHT_COLOR,
        });
      }

      return true;
    } catch (error) {
      console.error('[PushNotification] Error requesting permissions:', error);
      return false;
    }
  },

  /**
   * Get Expo push token
   * 
   * Retrieves the Expo push token for this device. This token is sent to
   * the server and used to send push notifications via Expo Push Notification service.
   * 
   * @returns {Promise<string | null>} Expo push token or null if unavailable
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
   * 
   * Gets the Expo push token and sends it to the server for storage.
   * Server will use this token to send push notifications to this device.
   * 
   * @returns {Promise<boolean>} True if registration successful, false otherwise
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
   * 
   * Registers listeners for notification events:
   * - Notifications received while app is in foreground
   * - User taps on notifications
   * 
   * @param {Function} onNotificationReceived - Callback for foreground notifications
   * @param {Function} onNotificationTapped - Callback for notification taps
   * @returns {(() => void) | null} Cleanup function to remove listeners, or null if socket unavailable
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
   * Get last notification response
   * 
   * Retrieves the notification that caused the app to open (if any).
   * Useful for handling deep links when app is opened from a notification.
   * 
   * @returns {Promise<Notifications.NotificationResponse | null>} Last notification response or null
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
   * Cancel all scheduled notifications
   * 
   * @returns {Promise<void>}
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Set badge count (iOS only)
   * 
   * Updates the app icon badge count to show unread notifications.
   * Only works on iOS; Android handles badges differently.
   * 
   * @param {number} count - Badge count to display
   * @returns {Promise<void>}
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  },
};

