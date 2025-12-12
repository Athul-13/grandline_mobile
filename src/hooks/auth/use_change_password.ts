import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/api/user_service';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Hook for changing password
 */
export const useChangePassword = () => {
  return useMutation<void, Error, ChangePasswordData>({
    mutationFn: async (data: ChangePasswordData) => {
      await userService.changePassword(data);
    },
    onError: (error: Error) => {
      console.error('Password change failed:', error);
    },
  });
};

