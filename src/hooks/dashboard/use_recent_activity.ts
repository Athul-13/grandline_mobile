import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api/dashboard_service';
import type { RecentActivity } from '../../types/dashboard';

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = () => {
  return useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      return await dashboardService.getRecentActivity();
    },
  });
};

