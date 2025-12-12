// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.grandline.com',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication (Shared endpoints for drivers)
  AUTH: {
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/token/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
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
    CHANGE_PASSWORD: '/driver/auth/change-password',
    UPDATE_LICENSE_CARD: '/driver/license-card',
    UPDATE_PROFILE_PICTURE: '/driver/profile-picture',
    ONBOARDING_PASSWORD: '/driver/onboarding/password',
    COMPLETE_ONBOARDING: '/driver/onboarding',
    GET_DRIVER_PROFILE: '/driver/profile',
    GET_DRIVER_INFO: '/driver/info',
  },
  
  // App Features
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/activity',
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
