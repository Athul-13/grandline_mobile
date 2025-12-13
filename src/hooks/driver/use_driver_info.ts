import { useQuery } from '@tanstack/react-query';
import { driverService } from '../../services/api/driver_service';

/**
 * Hook to fetch driver info
 */
export const useDriverInfo = () => {
  return useQuery<{ hasLicense: boolean; hasProfilePicture: boolean }>({
    queryKey: ['driver', 'info'],
    queryFn: async () => {
      return await driverService.getDriverInfo();
    },
  });
};

