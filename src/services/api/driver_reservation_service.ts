import { API_ENDPOINTS } from '../../constants/api';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';
import { grandlineAxiosClient } from './axios_client';

export type RiderPrivacy = 'NAME_ONLY' | 'FULL';

export interface DriverReservationItineraryStop {
  itineraryId: string;
  tripType: 'outbound' | 'return';
  stopOrder: number;
  locationName: string;
  latitude: number;
  longitude: number;
  arrivalTime: string; // ISO
  departureTime?: string; // ISO
  stopType: 'pickup' | 'stop' | 'dropoff';
  isDriverStaying: boolean;
  stayingDuration?: number;
}

export interface DriverReservationVehicle {
  vehicleId: string;
  vehicleModel: string;
  plateNumber: string;
  quantity: number;
}

export interface DriverReservationRider {
  userId: string;
  fullName: string;
  privacy: RiderPrivacy;
  email?: string;
  phoneNumber?: string;
}

export interface DriverReservationRouteData {
  outbound?: {
    totalDistance?: number;
    totalDuration?: number;
    routeGeometry?: string;
  };
  return?: {
    totalDistance?: number;
    totalDuration?: number;
    routeGeometry?: string;
  };
}

export interface DriverReservationDetailsResponse {
  reservationId: string;
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed' | 'refunded';
  tripType: 'one_way' | 'two_way';
  tripName?: string;
  eventType?: string;
  customEventType?: string;
  passengerCount?: number;
  selectedAmenities?: string[];
  reservationDate: string; // ISO
  confirmedAt?: string; // ISO
  driverChangedAt?: string; // ISO
  cancellationReason?: string;
  cancelledAt?: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
  vehicles: DriverReservationVehicle[];
  itinerary: DriverReservationItineraryStop[];
  routeData?: DriverReservationRouteData;
  rider: DriverReservationRider;
  tripStartAt: string; // ISO
  tripEndAt: string; // ISO
  startedAt?: string; // ISO - when driver explicitly started trip
  completedAt?: string; // ISO - when driver explicitly ended trip
  chatEnabled: boolean;
  driverReport?: {
    content: string;
    submittedAt: string; // ISO
  };
}

/**
 * Driver Reservation Service
 * Fetches detailed reservation information for drivers
 */
export const driverReservationService = {
  async getReservation(reservationId: string): Promise<DriverReservationDetailsResponse> {
    const response = await grandlineAxiosClient.get(
      `${API_ENDPOINTS.DRIVER.RESERVATIONS}/${reservationId}`
    );
    return unwrapAxiosResponse<DriverReservationDetailsResponse>(response);
  },
};

