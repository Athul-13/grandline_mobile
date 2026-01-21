import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../../services/api/trip_service';

/**
 * Hook for ending a trip
 * Updates dashboard cache after successful end
 */
export const useEndTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => tripService.endTrip(reservationId),
    onSuccess: () => {
      // Invalidate dashboard to refetch with updated trip state
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      // Invalidate reservation details
      queryClient.invalidateQueries({ queryKey: ['driver', 'reservation'] });
    },
  });
};

