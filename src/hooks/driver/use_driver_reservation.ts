import { useQuery } from '@tanstack/react-query';
import {
    driverReservationService,
    type DriverReservationDetailsResponse,
} from '../../services/api/driver_reservation_service';

/**
 * Hook to fetch driver reservation details
 * Uses React Query for caching and state management
 */
export const useDriverReservation = (reservationId: string) => {
  return useQuery<DriverReservationDetailsResponse>({
    queryKey: ['driver', 'reservation', reservationId],
    queryFn: () => driverReservationService.getReservation(reservationId),
    enabled: !!reservationId, // Only fetch if reservationId exists
  });
};

