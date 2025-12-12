import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../../store/hooks';
import { userService } from '../../services/api/user_service';
import { updateUserProfile } from '../../store/slices/auth_slice';
import type { User } from '../../types/auth/user';

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<User, Error, Partial<User>>({
    mutationFn: async (profileData: Partial<User>) => {
      return await userService.updateProfile(profileData);
    },
    onSuccess: (updatedProfile: User) => {
      // Update React Query cache
      queryClient.setQueryData<User>(['user', 'profile'], updatedProfile);

      // Sync with Redux auth slice
      dispatch(updateUserProfile(updatedProfile));

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: Error) => {
      console.error('Profile update failed:', error);
    },
  });
};

