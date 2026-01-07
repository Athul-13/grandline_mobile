import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DriverReservationDetailsResponse } from '../../services/api/driver_reservation_service';
import { tripService } from '../../services/api/trip_service';

/**
 * Hook for starting a trip
 * Updates dashboard cache after successful start
 */
export const useStartTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => tripService.startTrip(reservationId),
    onMutate: async (reservationId: string) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['driver', 'reservation', reservationId] });

      // Snapshot the previous value
      const previousReservation = queryClient.getQueryData<DriverReservationDetailsResponse>([
        'driver',
        'reservation',
        reservationId,
      ]);

      // Optimistically update the reservation cache
      if (previousReservation) {
        queryClient.setQueryData<DriverReservationDetailsResponse>(
          ['driver', 'reservation', reservationId],
          {
            ...previousReservation,
            startedAt: new Date().toISOString(),
          }
        );
      }

      // Return context with the previous value
      return { previousReservation };
    },
    onError: (err: any, reservationId, context) => {
      // Check if error is "Trip has already been started"
      // In this case, the trip is already started on the server, so we should
      // treat it as success and refetch instead of rolling back
      const errorMessage = err?.message || err?.data?.message || '';
      const isAlreadyStarted = 
        errorMessage.toLowerCase().includes('already been started') ||
        errorMessage.toLowerCase().includes('already started');

      if (isAlreadyStarted) {
        // Trip is already started - don't rollback, just refetch to get server state
        queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['driver', 'reservation', reservationId] });
        return; // Don't rollback the optimistic update
      }

      // For other errors, rollback to previous value
      if (context?.previousReservation) {
        queryClient.setQueryData(
          ['driver', 'reservation', reservationId],
          context.previousReservation
        );
      }
    },
    onSuccess: () => {
      // Invalidate dashboard to refetch with updated trip state
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      // Invalidate reservation details to ensure server data is fetched
      queryClient.invalidateQueries({ queryKey: ['driver', 'reservation'] });
    },
  });
};

