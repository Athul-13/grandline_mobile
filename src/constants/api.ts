// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.grandline.com',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Socket Configuration Constants
export const SOCKET_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'https://api.grandline.com',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  TIMEOUT: 20000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication (Shared endpoints for drivers)
  AUTH: {
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/token/refresh',
  },
  
  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    PROFILE_PICTURE_UPLOAD_URL: '/user/profile/upload-url',
    CHANGE_PASSWORD: '/user/change-password',
  },
  
  // Driver Onboarding
  DRIVER: {
    LOGIN: '/driver/auth/login',
    FORGOT_PASSWORD: '/driver/auth/forgot-password',
    RESET_PASSWORD: '/driver/auth/reset-password',
    CHANGE_PASSWORD: '/driver/auth/change-password',
    UPDATE_LICENSE_CARD: '/driver/license-card',
    UPDATE_PROFILE_PICTURE: '/driver/profile-picture',
    ONBOARDING_PASSWORD: '/driver/onboarding/password',
    COMPLETE_ONBOARDING: '/driver/onboarding',
    GET_DRIVER_PROFILE: '/driver/profile',
    GET_DRIVER_INFO: '/driver/info',
    PROFILE_PICTURE_UPLOAD_URL: '/driver/profile/upload-url',
    SAVE_FCM_TOKEN: '/driver/fcm-token',
    DASHBOARD: '/driver/dashboard',
    RESERVATIONS: '/driver/reservations',
  },
  
  // App Features
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/activity',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/mark-read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    UNREAD_COUNT: '/notifications/unread-count',
  },
  
  // Chat
  CHAT: {
    LIST: '/chats',
    CREATE: '/chats',
    BY_CONTEXT: '/chats/by-context',
    GET: (chatId: string) => `/chats/${chatId}`,
  },
  
  // Messages
  MESSAGES: {
    GET_CHAT_MESSAGES: (chatId: string) => `/messages/chat/${chatId}`,
    CHAT_UNREAD_COUNT: (chatId: string) => `/messages/chat/${chatId}/unread-count`,
    TOTAL_UNREAD_COUNT: '/messages/unread-count',
    MARK_AS_READ: '/messages/mark-as-read',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
