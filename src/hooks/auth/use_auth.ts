import { useAppSelector } from '../../store/hooks';
import type { AuthState } from '../../types/auth';

/**
 * Hook to access auth state from Redux
 */
export const useAuth = (): AuthState => {
  return useAppSelector((state) => state.auth);
};

