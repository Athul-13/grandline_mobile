import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/api/auth_service';
import type { AuthResponse, AuthState, Driver } from '../../types/auth';

// Initial state
const initialState: AuthState = {
  driver: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunk for token refresh (used by axios interceptor)
export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (_, { rejectWithValue }) => {
    try {
      const response: AuthResponse = await authService.refreshToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
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
    },

    // Clear authentication state (called on logout)
    clearAuthState: (state) => {
      state.driver = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
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
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

