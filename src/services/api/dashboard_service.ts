import { grandlineAxiosClient } from './axios_client';
import { API_ENDPOINTS } from '../../constants/api';
import type { DashboardStats, RecentActivity } from '../../types/dashboard';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';

/**
 * Dashboard Service
 */
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DASHBOARD.STATS
    );
    return unwrapAxiosResponse<DashboardStats>(response);
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY
    );
    return unwrapAxiosResponse<RecentActivity[]>(response);
  },
};

