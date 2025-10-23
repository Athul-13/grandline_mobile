import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, HTTP_STATUS } from '../../constants/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const newToken = await refreshAuthToken();
        if (newToken) {
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearAuthToken();
        // You can dispatch logout action here if needed
        console.log('🔄 Token refresh failed, redirecting to login');
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for token management
const getAuthToken = (): string | null => {
  // In a real app, you might get this from AsyncStorage or secure storage
  return null; // Placeholder
};

const setAuthToken = (token: string): void => {
  // In a real app, you would save this to AsyncStorage or secure storage
  console.log('🔑 Token saved:', token);
};

const clearAuthToken = (): void => {
  // In a real app, you would clear this from AsyncStorage or secure storage
  console.log('🗑️ Token cleared');
};

const refreshAuthToken = async (): Promise<string | null> => {
  try {
    // In a real app, you would call your refresh token endpoint
    // const response = await apiClient.post('/auth/refresh');
    // return response.data.token;
    return null; // Placeholder
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
};

export default apiClient;
