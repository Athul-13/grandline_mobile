// Store exports
export { store, useAppDispatch, useAppSelector } from './store';
export type { RootState, AppDispatch } from './store';

// Auth slice exports
export {
  loginUser,
  logoutUser,
  refreshUserToken,
  getCurrentUser,
  changePassword,
  completeDriverOnboarding,
  clearError,
  setLoading,
  updateUserProfile,
  setAuthState,
  clearAuthState,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from './slices/authSlice';

// Re-export auth types for convenience
export type { AuthState, User, LoginCredentials, AuthResponse } from '../types/auth';
