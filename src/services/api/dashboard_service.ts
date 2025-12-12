import { grandlineAxiosClient } from './axios_client';
import { API_ENDPOINTS } from '../../constants/api';
import type { DashboardStats, RecentActivity } from '../../types/dashboard';

/**
 * Dashboard Service
 */
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await grandlineAxiosClient.get<DashboardStats>(
      API_ENDPOINTS.DASHBOARD.STATS
    );
    return response.data;
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await grandlineAxiosClient.get<RecentActivity[]>(
      API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY
    );
    return response.data;
  },
};

