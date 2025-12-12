import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../../store/hooks';
import { authService } from '../../services/api/auth_service';
import { clearAuthState } from '../../store/slices/auth_slice';

/**
 * Hook for user logout
 * Uses React Query mutation and clears Redux auth state
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Clear Redux auth state
      dispatch(clearAuthState());

      // Clear all queries
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local state
      dispatch(clearAuthState());
      queryClient.clear();
    },
  });
};

