import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/api/auth_service';

/**
 * Hook for driver reset password
 * Uses React Query mutation
 */
export const useResetPassword = () => {
  return useMutation<void, Error, { token: string; newPassword: string }>({
    mutationFn: async (resetData: { token: string; newPassword: string }) => {
      return await authService.resetPassword(resetData);
    },
    onError: (error: Error) => {
      console.error('Reset password failed:', error);
    },
  });
};

