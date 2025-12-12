// Store exports
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Store hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Auth slice exports
export {
  refreshUserToken,
  clearError,
  setLoading,
  updateUserProfile,
  setAuthState,
  clearAuthState,
  updateTokens,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from './slices/auth_slice';

// Re-export auth types for convenience
export type { AuthState, User, LoginCredentials, AuthResponse } from '../types/auth';
