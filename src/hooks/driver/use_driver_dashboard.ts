import { useInfiniteQuery } from '@tanstack/react-query';
import {
    driverDashboardService,
    type DriverDashboardResponse,
    type GetDriverDashboardParams,
} from '../../services/api/driver_dashboard_service';

/**
 * Hook to fetch driver dashboard (current/upcoming/past trips).
 * Server is source of truth for grouping, privacy, and messaging eligibility.
 */
export const useDriverDashboard = (params?: GetDriverDashboardParams) => {
  return useInfiniteQuery<DriverDashboardResponse>({
    queryKey: ['driver', 'dashboard', params?.pastLimit ?? null],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      return await driverDashboardService.getDashboard({
        pastLimit: params?.pastLimit,
        pastCursor: typeof pageParam === 'string' ? pageParam : undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.pastTrips.nextCursor ?? undefined,
  });
};


