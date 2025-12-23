import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../../services/api/trip_service';
import { useDriverDashboard } from './use_driver_dashboard';

/**
 * Hook for starting a trip
 * Updates dashboard cache after successful start
 */
export const useStartTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => tripService.startTrip(reservationId),
    onSuccess: () => {
      // Invalidate dashboard to refetch with updated trip state
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      // Invalidate reservation details
      queryClient.invalidateQueries({ queryKey: ['driver', 'reservation'] });
    },
  });
};

