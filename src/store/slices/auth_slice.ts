import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/api/auth_service';
import { authStorage } from '../../services/storage/auth_storage';
import type { AuthResponse, AuthState, Driver } from '../../types/auth';

// Initial state
const initialState: AuthState = {
  driver: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoring: false,
  error: null,
};

// Async thunk for token refresh (used by axios interceptor)
export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (_, { rejectWithValue }) => {
    try {
      const response: AuthResponse = await authService.refreshToken();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Auth slice - handles only global auth state
// Server state is managed by React Query
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set authentication state (called after successful login)
    setAuthState: (
      state,
      action: PayloadAction<{
        driver: Driver;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.driver = action.payload.driver;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      
      // Save to secure storage
      authStorage.saveAuthData({
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        driver: action.payload.driver,
      }).catch((error) => {
        console.error('[AuthSlice] Error saving auth data to storage:', error);
      });
    },

    // Restore authentication state from storage (called on app startup)
    restoreAuthState: (
      state,
      action: PayloadAction<{
        driver: Driver | null;
        accessToken: string | null;
        refreshToken: string | null;
      }>
    ) => {
      state.driver = action.payload.driver;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = !!(
        action.payload.accessToken &&
        action.payload.refreshToken &&
        action.payload.driver
      );
      state.isRestoring = false;
      state.error = null;
    },

    // Set restoring state
    setRestoring: (state, action: PayloadAction<boolean>) => {
      state.isRestoring = action.payload;
    },

    // Clear authentication state (called on logout)
    clearAuthState: (state) => {
      state.driver = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear from secure storage
      authStorage.clearAuthData().catch((error) => {
        console.error('[AuthSlice] Error clearing auth data from storage:', error);
      });
    },

    // Update driver profile (sync with React Query cache)
    updateDriverProfile: (state, action: PayloadAction<Partial<Driver>>) => {
      if (state.driver) {
        state.driver = { ...state.driver, ...action.payload };
      }
    },

    // Update tokens (called after token refresh)
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      
      // Update in secure storage
      authStorage.updateTokens({
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      }).catch((error) => {
        console.error('[AuthSlice] Error updating tokens in storage:', error);
      });
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set loading state (if needed for UI)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle token refresh
    builder
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        // Update tokens in secure storage
        authStorage.updateTokens({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        }).catch((error) => {
          console.error('[AuthSlice] Error updating tokens in storage after refresh:', error);
        });
      })
      .addCase(refreshUserToken.rejected, (state) => {
        // If refresh fails, clear auth state
        state.driver = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

// Export actions
export const {
  setAuthState,
  restoreAuthState,
  setRestoring,
  clearAuthState,
  updateDriverProfile,
  updateTokens,
  clearError,
  setLoading,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectDriver = (state: { auth: AuthState }) => state.auth.driver;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsRestoring = (state: { auth: AuthState }) => state.auth.isRestoring;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

