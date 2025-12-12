import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../../store/hooks';
import { userService } from '../../services/api/user_service';
import { updateDriverProfile } from '../../store/slices/auth_slice';
import type { Driver } from '../../types/driver';

/**
 * Hook to update driver profile
 * Note: Uses user service endpoint but updates driver state in Redux
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<Driver, Error, Partial<Driver>>({
    mutationFn: async (profileData: Partial<Driver>) => {
      // User service returns User type, but we'll map it to Driver
      const userProfile = await userService.updateProfile(profileData as any);
      // Map User to Driver structure (if needed)
      return userProfile as unknown as Driver;
    },
    onSuccess: (updatedProfile: Driver) => {
      // Update React Query cache
      queryClient.setQueryData<Driver>(['driver', 'profile'], updatedProfile);

      // Sync with Redux auth slice
      dispatch(updateDriverProfile(updatedProfile));

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
    },
    onError: (error: Error) => {
      console.error('Profile update failed:', error);
    },
  });
};

