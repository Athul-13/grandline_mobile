import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../../store/hooks';
import { authService } from '../../services/api/auth_service';
import { setAuthState } from '../../store/slices/auth_slice';
import type { LoginCredentials, AuthResponse } from '../../types/auth';

/**
 * Hook for user login
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
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
};

