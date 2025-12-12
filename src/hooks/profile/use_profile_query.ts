import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/api/user_service';
import type { User } from '../../types/auth/user';

/**
 * Hook to fetch user profile
 * Uses React Query for automatic caching and refetching
 */
export const useProfileQuery = () => {
  return useQuery<User>({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      return await userService.getProfile();
    },
  });
};

