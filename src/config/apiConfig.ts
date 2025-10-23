// API Configuration
export const API_CONFIG = {
  // Set to false to use real API endpoints
  USE_MOCK_API: true,
  
  // Mock API settings
  MOCK: {
    // Simulate network delays (in milliseconds)
    DELAY: {
      MIN: 500,
      MAX: 2500,
    },
    // Mock user credentials for testing
    TEST_CREDENTIALS: {
      email: 'test@test.com',
      password: 'password',
    },
  },
  
  // Real API settings
  REAL: {
    BASE_URL: 'https://api.grandline.com',
    TIMEOUT: 10000,
  },
};

// Helper function to check if using mock API
export const isUsingMockAPI = () => API_CONFIG.USE_MOCK_API;

// Helper function to get random delay for mock API
export const getMockDelay = () => 
  Math.random() * (API_CONFIG.MOCK.DELAY.MAX - API_CONFIG.MOCK.DELAY.MIN) + API_CONFIG.MOCK.DELAY.MIN;
