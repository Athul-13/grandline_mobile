import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/api/auth_service';
import { useAppDispatch } from '../../store/hooks';
import { setAuthState } from '../../store/slices/auth_slice';
import type { AuthResponse, LoginCredentials } from '../../types/auth';

/**
 * Hook for driver login
 * Uses React Query mutation and updates Redux auth state
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return await authService.login(credentials);
    },
    onSuccess: (data: AuthResponse) => {
      // Update Redux auth state
      dispatch(
        setAuthState({
          driver: data.driver,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      // Invalidate and refetch driver-related queries
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
};

