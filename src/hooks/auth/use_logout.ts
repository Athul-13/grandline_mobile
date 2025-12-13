import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/api/auth_service';
import { disconnectSocket } from '../../services/socket/socket_client';
import { useAppDispatch } from '../../store/hooks';
import { clearAuthState } from '../../store/slices/auth_slice';

/**
 * Hook for user logout
 * Uses React Query mutation and clears Redux auth state
 * Also disconnects socket connection on logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Disconnect socket connection
      disconnectSocket();

      // Clear Redux auth state
      dispatch(clearAuthState());

      // Clear all queries
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      // Disconnect socket even if logout fails
      disconnectSocket();
      // Even if logout fails on server, clear local state
      dispatch(clearAuthState());
      queryClient.clear();
    },
  });
};

