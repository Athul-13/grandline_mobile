import { useMutation } from '@tanstack/react-query';
import { driverService } from '../../services/api/driver_service';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Hook for changing driver password (authenticated)
 * Uses driver-specific endpoint
 */
export const useChangePassword = () => {
  return useMutation<void, Error, ChangePasswordData>({
    mutationFn: async (data: ChangePasswordData) => {
      await driverService.changePassword(data);
    },
    onError: (error: Error) => {
      console.error('Password change failed:', error);
    },
  });
};

