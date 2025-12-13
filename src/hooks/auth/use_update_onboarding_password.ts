import { useMutation } from '@tanstack/react-query';
import { driverService } from '../../services/api/driver_service';

interface UpdateOnboardingPasswordData {
  newPassword: string;
}

/**
 * Hook for updating driver password during onboarding
 * Uses onboarding-specific endpoint that only requires newPassword
 */
export const useUpdateOnboardingPassword = () => {
  return useMutation<void, Error, UpdateOnboardingPasswordData>({
    mutationFn: async (data: UpdateOnboardingPasswordData) => {
      await driverService.updateOnboardingPassword(data);
    },
    onError: (error: Error) => {
      console.error('Onboarding password update failed:', error);
    },
  });
};

