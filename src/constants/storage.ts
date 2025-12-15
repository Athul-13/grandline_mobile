/**
 * Storage Constants
 * Centralized storage keys for AsyncStorage
 */

/**
 * Storage keys for notifications
 */
export const NOTIFICATION_STORAGE_KEYS = {
  NOTIFICATIONS: '@grandline:notifications',
  UNREAD_COUNT: '@grandline:notifications:unread_count',
  LAST_SYNC: '@grandline:notifications:last_sync',
} as const;

/**
 * Storage keys for chats
 */
export const CHAT_STORAGE_KEYS = {
  CHATS: '@grandline:chats',
  MESSAGES: (chatId: string) => `@grandline:messages:${chatId}`,
  LAST_SYNC: '@grandline:chats:last_sync',
  OFFLINE_QUEUE: '@grandline:chats:offline_queue',
} as const;

/**
 * Storage key for offline queue
 */
export const OFFLINE_QUEUE_STORAGE_KEY = '@grandline:offline_queue';

/**
 * Storage keys for authentication
 * Note: SecureStore keys must only contain alphanumeric characters, ".", "-", and "_"
 * AsyncStorage keys can use "@" and ":"
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'grandline_auth_access_token', // SecureStore
  REFRESH_TOKEN: 'grandline_auth_refresh_token', // SecureStore
  DRIVER_PROFILE: '@grandline:auth:driver_profile', // AsyncStorage
} as const;

