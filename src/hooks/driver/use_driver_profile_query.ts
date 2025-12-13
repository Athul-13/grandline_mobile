import { useQuery } from '@tanstack/react-query';
import { driverService } from '../../services/api/driver_service';
import type { Driver } from '../../types/driver';

/**
 * Hook to fetch driver profile
 * Uses React Query for automatic caching and refetching
 */
export const useDriverProfileQuery = () => {
  return useQuery<Driver>({
    queryKey: ['driver', 'profile'],
    queryFn: async () => {
      return await driverService.getDriverProfile();
    },
  });
};

