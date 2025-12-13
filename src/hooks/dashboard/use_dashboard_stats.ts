import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api/dashboard_service';
import type { DashboardStats } from '../../types/dashboard';

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      return await dashboardService.getStats();
    },
  });
};

