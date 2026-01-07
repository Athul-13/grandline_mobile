import { API_ENDPOINTS } from '../../constants/api';
import { unwrapAxiosResponse } from '../../utils/response_unwrapper';
import { grandlineAxiosClient } from './axios_client';

export interface Reservation {
  reservationId: string;
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed' | 'refunded';
  startedAt?: string; // ISO
  completedAt?: string; // ISO
  // ... other fields
}

export interface StartTripResponse {
  reservation: Reservation;
}

export interface EndTripResponse {
  reservation: Reservation;
}

export interface SubmitDriverReportResponse {
  reservation: Reservation;
}

/**
 * Trip Service
 * Handles trip lifecycle operations (start/end trip)
 */
export const tripService = {
  /**
   * Start a trip
   * POST /api/v1/driver/trips/:reservationId/start
   */
  async startTrip(reservationId: string): Promise<StartTripResponse> {
    const response = await grandlineAxiosClient.post<StartTripResponse>(
      API_ENDPOINTS.DRIVER.START_TRIP(reservationId)
    );
    return unwrapAxiosResponse<StartTripResponse>(response);
  },

  /**
   * End a trip
   * POST /api/v1/driver/trips/:reservationId/end
   */
  async endTrip(reservationId: string): Promise<EndTripResponse> {
    const response = await grandlineAxiosClient.post<EndTripResponse>(
      API_ENDPOINTS.DRIVER.END_TRIP(reservationId)
    );
    return unwrapAxiosResponse<EndTripResponse>(response);
  },

  /**
   * Submit driver report for a completed trip
   * POST /api/v1/driver/trips/:reservationId/report
   */
  async submitDriverReport(
    reservationId: string,
    reportContent: string
  ): Promise<SubmitDriverReportResponse> {
    const response = await grandlineAxiosClient.post<SubmitDriverReportResponse>(
      API_ENDPOINTS.DRIVER.SUBMIT_REPORT(reservationId),
      { reportContent }
    );
    return unwrapAxiosResponse<SubmitDriverReportResponse>(response);
  },
};

