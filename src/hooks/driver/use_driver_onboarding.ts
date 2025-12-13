import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '../../services/api/driver_service';
import type { DriverOnboardingData } from '../../types/auth/auth';

/**
 * Hook for completing driver onboarding
 */
export const useDriverOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { isOnboardingComplete: boolean },
    Error,
    DriverOnboardingData
  >({
    mutationFn: async (onboardingData: DriverOnboardingData) => {
      return await driverService.completeOnboarding(onboardingData);
    },
    onSuccess: () => {
      // Invalidate user profile to refresh onboarding status
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'info'] });
    },
    onError: (error: Error) => {
      console.error('Driver onboarding failed:', error);
    },
  });
};

