import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/api/auth_service';

/**
 * Hook for driver forgot password
 * Uses React Query mutation
 */
export const useForgotPassword = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (email: string) => {
      return await authService.forgotPassword(email);
    },
    onError: (error: Error) => {
      console.error('Forgot password failed:', error);
    },
  });
};

