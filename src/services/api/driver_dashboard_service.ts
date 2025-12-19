import { API_ENDPOINTS } from '../../constants/api';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';
import { grandlineAxiosClient } from './axios_client';

export type DriverTripState = 'CURRENT' | 'UPCOMING' | 'PAST';
export type RiderPrivacy = 'NAME_ONLY' | 'FULL';

export interface DriverDashboardTripStop {
  label: string;
  lat: number;
  lng: number;
  time: string; // ISO
  stopType: 'pickup' | 'stop' | 'dropoff';
  tripType: 'outbound' | 'return';
  stopOrder: number;
}

export interface DriverDashboardRider {
  userId: string;
  fullName: string;
  privacy: RiderPrivacy;
  email?: string;
  phoneNumber?: string;
}

export interface DriverDashboardVehicle {
  vehicleId: string;
  vehicleModel: string;
  plateNumber: string;
  quantity: number;
}

export interface DriverDashboardMessaging {
  chatEnabled: boolean;
  contextType: 'reservation';
  contextId: string; // reservationId
}

export interface DriverDashboardTripCard {
  reservationId: string;
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed' | 'refunded';
  tripType: 'one_way' | 'two_way';
  tripState: DriverTripState;
  tripStartAt: string; // ISO
  tripEndAt: string; // ISO
  pickup: DriverDashboardTripStop;
  dropoff: DriverDashboardTripStop;
  rider: DriverDashboardRider;
  vehicles: DriverDashboardVehicle[];
  messaging: DriverDashboardMessaging;
}

export interface DriverDashboardResponse {
  serverTime: string; // ISO
  currentTrip: DriverDashboardTripCard | null;
  upcomingTrips: DriverDashboardTripCard[];
  pastTrips: {
    items: DriverDashboardTripCard[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface GetDriverDashboardParams {
  pastCursor?: string;
  pastLimit?: number;
}

/**
 * Driver Dashboard Service
 * Fetches aggregated trips for driver dashboard from a single endpoint.
 */
export const driverDashboardService = {
  async getDashboard(params?: GetDriverDashboardParams): Promise<DriverDashboardResponse> {
    const response = await grandlineAxiosClient.get(
      API_ENDPOINTS.DRIVER.DASHBOARD,
      {
        params: {
          pastCursor: params?.pastCursor,
          pastLimit: params?.pastLimit,
        },
      }
    );
    return unwrapAxiosResponse<DriverDashboardResponse>(response);
  },
};


