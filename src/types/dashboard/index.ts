// Dashboard-related types
export interface DashboardStats {
  readonly totalRides: number;
  readonly earnings: number;
  readonly rating: number;
}

export interface RecentActivity {
  readonly id: string;
  readonly type: string;
  readonly date: string;
  readonly amount?: number;
}

