/**
 * Push Notification Constants
 * Constants for push notification configuration
 */

/**
 * Default notification channel for Android
 */
export const PUSH_NOTIFICATION_CHANNEL = {
  ID: 'default',
  NAME: 'Default',
  IMPORTANCE: 'MAX' as const,
  VIBRATION_PATTERN: [0, 250, 250, 250] as const,
  LIGHT_COLOR: '#FF231F7C',
} as const;

/**
 * Notification behavior configuration
 */
export const NOTIFICATION_BEHAVIOR = {
  SHOULD_SHOW_ALERT: true,
  SHOULD_PLAY_SOUND: true,
  SHOULD_SET_BADGE: true,
  SHOULD_SHOW_BANNER: true,
  SHOULD_SHOW_LIST: true,
} as const;

