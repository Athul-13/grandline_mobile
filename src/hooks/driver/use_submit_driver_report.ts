import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../../services/api/trip_service';

/**
 * Hook for submitting driver trip report
 * Updates reservation cache after successful submission
 */
export const useSubmitDriverReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, reportContent }: { reservationId: string; reportContent: string }) =>
      tripService.submitDriverReport(reservationId, reportContent),
    onSuccess: (_, variables) => {
      // Invalidate reservation details to refetch with updated report
      queryClient.invalidateQueries({ queryKey: ['driver', 'reservation', variables.reservationId] });
      // Invalidate dashboard to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
    },
  });
};

