/**
 * Trip Socket Event Types
 * Types for trip-related socket events (driver changes, vehicle changes)
 */

export type TripState = 'UPCOMING' | 'CURRENT' | 'PAST';

/**
 * Driver Changed Event
 * Emitted when admin changes driver for a reservation
 */
export interface TripDriverChangedEvent {
  reservationId: string;
  oldDriverId: string | null | undefined; // Can be null or undefined from server
  newDriverId: string;
  tripState: TripState;
  changedAt: string; // ISO timestamp
}

/**
 * Vehicle Changed Event
 * Emitted when admin adjusts vehicles for a reservation
 */
export interface TripVehicleChangedEvent {
  reservationId: string;
  vehicles: Array<{
    vehicleId: string;
    quantity: number;
  }>;
  changedAt: string; // ISO timestamp
}

