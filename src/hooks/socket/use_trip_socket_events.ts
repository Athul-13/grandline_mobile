/**
 * Trip Socket Events Hook
 * Listens for trip-related socket events and handles driver/vehicle changes
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { locationTrackingService } from '../../services/location/location_tracking_service';
import { tripSocketService } from '../../services/socket/trip_socket_service';
import type { RootState } from '../../store/store';
import type { TripDriverChangedEvent, TripVehicleChangedEvent } from '../../types/driver/trip_socket_events';

/**
 * Hook to listen for trip socket events and handle driver/vehicle changes
 * 
 * Handles:
 * - trip:driver_changed: Stops location tracking if driver lost trip, invalidates queries if driver gained trip
 * - trip:vehicle_changed: Invalidates reservation queries to update vehicle info
 */
export const useTripSocketEvents = (): void => {
  const queryClient = useQueryClient();
  const driver = useSelector((state: RootState) => state.auth.driver);
  const driverId = driver?.driverId || null;

  useEffect(() => {
    if (!driverId) {
      // No driver ID, skip setting up listeners
      return;
    }

    // Handle driver changed event
    const cleanupDriverChanged = tripSocketService.onDriverChanged(
      (event: TripDriverChangedEvent) => {
        console.log('[useTripSocketEvents] Driver changed event received:', event);

        // Check if current driver lost the trip (oldDriverId === current driver)
        if (event.oldDriverId === driverId) {
          console.log('[useTripSocketEvents] Current driver lost trip, stopping location tracking and invalidating queries');
          
          // Stop location tracking immediately
          const currentReservationId = locationTrackingService.getCurrentReservationId();
          if (currentReservationId === event.reservationId) {
            locationTrackingService.stopTracking().catch((error) => {
              console.error('[useTripSocketEvents] Error stopping location tracking:', error);
            });
          }

          // Invalidate dashboard query to remove trip from dashboard
          queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
          
          // Invalidate reservation query if it's the affected reservation
          queryClient.invalidateQueries({ 
            queryKey: ['driver', 'reservation', event.reservationId] 
          });
        }

        // Check if current driver gained the trip (newDriverId === current driver)
        if (event.newDriverId === driverId) {
          console.log('[useTripSocketEvents] Current driver gained trip, invalidating dashboard query');
          
          // Invalidate dashboard query to show trip instantly
          queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
          
          // If trip state is CURRENT, map should show active trip (handled by dashboard refetch)
          // Location tracking will start automatically when dashboard refetches and detects CURRENT trip
        }
      }
    );

    // Handle vehicle changed event
    const cleanupVehicleChanged = tripSocketService.onVehicleChanged(
      (event: TripVehicleChangedEvent) => {
        console.log('[useTripSocketEvents] Vehicle changed event received:', event);

        // Invalidate reservation query to update vehicle details
        // This will update vehicle info in:
        // - Dashboard trip cards
        // - Trip detail screen
        // - Map header (if visible)
        queryClient.invalidateQueries({ 
          queryKey: ['driver', 'reservation', event.reservationId] 
        });
        
        // Also invalidate dashboard to update vehicle info in trip cards
        queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      }
    );

    // Cleanup listeners on unmount
    return () => {
      cleanupDriverChanged?.();
      cleanupVehicleChanged?.();
    };
  }, [driverId, queryClient]);
};

