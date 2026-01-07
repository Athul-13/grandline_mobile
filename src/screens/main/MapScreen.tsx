/**
 * Map Screen
 * Main Map tab that automatically shows active trip (if any)
 * Server is source of truth - fetches active trip on mount and refetch
 */

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, Polyline, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripReportModal } from '../../components/trips/trip_report_modal';
import { borderRadius, shadows, spacing, tabBar, typography } from '../../constants/theme';
import { useEndTrip, useSubmitDriverReport } from '../../hooks/driver';
import { useDriverDashboard } from '../../hooks/driver/use_driver_dashboard';
import { useDriverReservation } from '../../hooks/driver/use_driver_reservation';
import { useLocationTracking } from '../../hooks/location/use_location_tracking';
import { useTheme } from '../../hooks/use-theme';
import { calculateDistance } from '../../utils/interpolation';
import { formatTimeAgo } from '../../utils/time_format';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Parse GeoJSON LineString to coordinates array
 */
const parseRouteGeometry = (routeGeometry?: string): Coordinate[] => {
  if (!routeGeometry) return [];

  try {
    const geoJson = JSON.parse(routeGeometry);
    if (geoJson.type === 'LineString' && Array.isArray(geoJson.coordinates)) {
      return geoJson.coordinates.map((coord: number[]) => ({
        longitude: coord[0],
        latitude: coord[1],
      }));
    }
  } catch (error) {
    console.error('Error parsing route geometry:', error);
  }

  return [];
};

/**
 * Calculate map region to fit all coordinates
 */
const calculateRegion = (coordinates: Coordinate[], padding: number = 0.1): MapRegion => {
  if (coordinates.length === 0) {
    return {
      latitude: 9.9312, // Kochi fallback
      longitude: 76.2673,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  const lats = coordinates.map((c) => c.latitude);
  const lngs = coordinates.map((c) => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = (maxLat - minLat) * (1 + padding);
  const lngDelta = (maxLng - minLng) * (1 + padding);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
};

export const MapScreen: React.FC = () => {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);
  
  // Driver marker position (using state for Marker coordinate, Animated for smooth updates)
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [driverMarkerCoord, setDriverMarkerCoord] = useState<Coordinate | null>(null);
  const [driverHeading, setDriverHeading] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Camera state
  const [isFollowing, setIsFollowing] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const currentRegionRef = useRef<Region | null>(null);

  // Fetch driver dashboard to get active trip
  // React Query automatically refetches on mount (refetchOnMount: true by default)
  // This ensures Map tab always reflects current server state when navigated to
  const dashboardQuery = useDriverDashboard({ pastLimit: 1 });
  const firstPage = dashboardQuery.data?.pages?.[0];
  const currentTrip = firstPage?.currentTrip ?? null;

  // Determine if trip is active
  // Server determines currentTrip by tripState === 'CURRENT' (which is derived from startedAt)
  // Since startedAt/completedAt are not in the dashboard response, we use tripState
  const isActiveTrip = currentTrip?.tripState === 'CURRENT';
  const activeReservationId = isActiveTrip ? currentTrip.reservationId : null;

  // Fetch full reservation details if active trip exists
  const reservationQuery = useDriverReservation(activeReservationId || '');

  // End Trip mutation
  const endTripMutation = useEndTrip();
  const submitReportMutation = useSubmitDriverReport();
  const [showReportModal, setShowReportModal] = useState(false);
  const reportReservationIdRef = useRef<string | null>(null); // Store reservationId for report submission

  // Location tracking for active trip (sends updates to server)
  // tripState === 'CURRENT' means startedAt exists and completedAt is null (per server logic)
  useLocationTracking({
    reservationId: activeReservationId,
    isTripStarted: isActiveTrip, // tripState === 'CURRENT' implies startedAt exists
    isTripCompleted: false, // tripState === 'CURRENT' implies completedAt is null
    enabled: isActiveTrip,
  });

  // Request location permission and watch location for display
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermissionGranted(true);
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          // Watch location for driver marker display (only if active trip)
          if (isActiveTrip) {
            locationSubscriptionRef.current = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 1000, // Update every second for smooth animation
                distanceInterval: 5, // Update every 5 meters
              },
              (newLocation) => {
                setDriverLocation(newLocation);
                setLastUpdateTime(Date.now());
                
                // Cancel previous animation if running
                if (animationRef.current) {
                  animationRef.current.stop();
                }
                
                // Smoothly animate marker to new position
                const startCoord = driverMarkerCoord || {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                };
                const endCoord = {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                };
                
                const startHeading = driverHeading;
                const endHeading = newLocation.coords.heading || 0;
                
                // Use Animated.Value for interpolation
                const latAnim = new Animated.Value(startCoord.latitude);
                const lngAnim = new Animated.Value(startCoord.longitude);
                const headingAnim = new Animated.Value(startHeading);
                
                // Update state via listener for smooth animation
                const latListener = latAnim.addListener(({ value }) => {
                  setDriverMarkerCoord((prev) => ({
                    latitude: value,
                    longitude: prev?.longitude || endCoord.longitude,
                  }));
                });
                
                const lngListener = lngAnim.addListener(({ value }) => {
                  setDriverMarkerCoord((prev) => ({
                    latitude: prev?.latitude || endCoord.latitude,
                    longitude: value,
                  }));
                });
                
                const headingListener = headingAnim.addListener(({ value }) => {
                  setDriverHeading(value);
                });
                
                const duration = 4000; // 4 second animation
                animationRef.current = Animated.parallel([
                  Animated.timing(latAnim, {
                    toValue: endCoord.latitude,
                    duration,
                    useNativeDriver: false,
                  }),
                  Animated.timing(lngAnim, {
                    toValue: endCoord.longitude,
                    duration,
                    useNativeDriver: false,
                  }),
                  Animated.timing(headingAnim, {
                    toValue: endHeading,
                    duration,
                    useNativeDriver: false,
                  }),
                ]);
                
                animationRef.current.start(() => {
                  // Cleanup listeners when animation completes
                  latAnim.removeListener(latListener);
                  lngAnim.removeListener(lngListener);
                  headingAnim.removeListener(headingListener);
                  // Set final values
                  setDriverMarkerCoord(endCoord);
                  setDriverHeading(endHeading);
                  animationRef.current = null;
                });
                
                // Handle camera auto-follow
                if (isFollowing && !userHasInteracted && mapRef.current) {
                  const currentCenter = currentRegionRef.current;
                  if (currentCenter) {
                    const distance = calculateDistance(
                      currentCenter.latitude,
                      currentCenter.longitude,
                      newLocation.coords.latitude,
                      newLocation.coords.longitude
                    );
                    
                    // Only move camera if driver moved significantly (>50m)
                    // Use a longer animation duration to avoid interfering with user gestures
                    if (distance > 0.05) {
                      const newRegion: Region = {
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                        latitudeDelta: currentCenter.latitudeDelta,
                        longitudeDelta: currentCenter.longitudeDelta,
                      };
                      // Use a smoother, longer animation to avoid conflicts with user interaction
                      mapRef.current.animateToRegion(newRegion, 2000);
                      currentRegionRef.current = newRegion;
                    }
                  }
                }
              }
            );
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
    
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [isActiveTrip, isFollowing, userHasInteracted, driverMarkerCoord, driverHeading]);
  
  // Initialize driver marker position when first location received
  useEffect(() => {
    if (driverLocation && !driverMarkerCoord) {
      setDriverMarkerCoord({
        latitude: driverLocation.coords.latitude,
        longitude: driverLocation.coords.longitude,
      });
      setDriverHeading(driverLocation.coords.heading || 0);
    }
  }, [driverLocation, driverMarkerCoord]);

  // Handle End Trip
  const handleEndTrip = async () => {
    if (!activeReservationId) return;

    try {
      // Capture reservationId before trip ends (it will become null after)
      reportReservationIdRef.current = activeReservationId;
      await endTripMutation.mutateAsync(activeReservationId);
      // Show report modal after successful trip end (optional - driver can skip)
      setShowReportModal(true);
    } catch (error) {
      console.error('Failed to end trip:', error);
      Alert.alert('Error', 'Failed to end trip. Please try again.');
      reportReservationIdRef.current = null; // Clear on error
    }
  };

  // Handle Submit Report
  const handleSubmitReport = async (reportContent: string) => {
    // Use the captured reservationId from ref
    const reservationId = reportReservationIdRef.current;
    if (!reservationId) {
      Alert.alert('Error', 'Reservation ID not available');
      return;
    }

    try {
      await submitReportMutation.mutateAsync({
        reservationId,
        reportContent,
      });
      // Clear the ref after successful submission
      reportReservationIdRef.current = null;
      // Modal will close on success
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to submit report';
      Alert.alert('Error', errorMessage);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  // Calculate map region when reservation data changes
  const reservation = reservationQuery.data;
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 9.9312,
    longitude: 76.2673,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (reservation && reservation.itinerary.length > 0) {
      const allCoordinates: Coordinate[] = [
        ...reservation.itinerary.map((stop) => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
        })),
        ...(userLocation ? [userLocation] : []),
      ];

      // Add route coordinates if available
      if (reservation.routeData?.outbound?.routeGeometry) {
        const routeCoords = parseRouteGeometry(reservation.routeData.outbound.routeGeometry);
        allCoordinates.push(...routeCoords);
      }

      const region = calculateRegion(allCoordinates);
      setMapRegion(region);

      // Animate map to region
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } else if (userLocation) {
      // If no reservation, center on user location
      const region: MapRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setMapRegion(region);
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    }
  }, [reservation, userLocation]);

  // Get icon for stop type
  const getStopIcon = (stopType: 'pickup' | 'stop' | 'dropoff'): keyof typeof Ionicons.glyphMap => {
    if (stopType === 'pickup') return 'location';
    if (stopType === 'dropoff') return 'flag';
    return 'ellipse';
  };

  // Loading state
  if (dashboardQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading map...</Text>
      </View>
    );
  }

  // Loading reservation details
  if (isActiveTrip && reservationQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading trip details...</Text>
      </View>
    );
  }

  // Empty state - no active trip
  if (!isActiveTrip || !reservation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={mapRegion}
          showsUserLocation={locationPermissionGranted}
          showsMyLocationButton={false}
        />

        {/* Empty State Overlay */}
        <View style={styles.emptyStateContainer}>
          <View style={[styles.emptyStateCard, { backgroundColor: theme.card }, shadows.md]}>
            <Ionicons name="map-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Active Trip</Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}>
              Start a trip from the trip details screen to see it on the map
            </Text>
          </View>
        </View>

        {/* Trip Report Modal - Must be here too to persist after trip ends */}
        <TripReportModal
          isVisible={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            reportReservationIdRef.current = null; // Clear ref when modal closes
          }}
          onSubmit={handleSubmitReport}
          isLoading={submitReportMutation.isPending}
        />
      </View>
    );
  }

  // Active trip state - show route, markers, and End Trip button
  const outboundStops = reservation.itinerary
    .filter((stop) => stop.tripType === 'outbound')
    .sort((a, b) => a.stopOrder - b.stopOrder);

  const routeCoordinates = parseRouteGeometry(reservation.routeData?.outbound?.routeGeometry);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={mapRegion}
        showsUserLocation={false} // Use custom animated marker instead
        showsMyLocationButton={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onRegionChange={(newRegion: Region) => {
          // Detect user interaction when region changes
          if (!isFollowing) {
            setMapRegion(newRegion);
            currentRegionRef.current = newRegion;
          }
        }}
        onRegionChangeComplete={(newRegion: Region) => {
          setMapRegion(newRegion);
          currentRegionRef.current = newRegion;
        }}
        onPanDrag={() => {
          setUserHasInteracted(true);
          setIsFollowing(false);
        }}
        onPress={() => {
          setUserHasInteracted(true);
          setIsFollowing(false);
        }}
        onPoiClick={() => {
          setUserHasInteracted(true);
          setIsFollowing(false);
        }}
      >
        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={theme.primary}
            strokeWidth={4}
            lineDashPattern={[]}
          />
        )}

        {/* Driver Marker (Animated) */}
        {driverMarkerCoord && (
          <Marker
            coordinate={driverMarkerCoord}
            rotation={driverHeading}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.driverMarkerContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name="car" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Stop Markers */}
        {outboundStops.map((stop) => (
          <Marker
            key={stop.itineraryId}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
          >
            <View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name={getStopIcon(stop.stopType)} size={20} color="#FFFFFF" />
            </View>
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={[styles.calloutTitle, { color: theme.text }]} numberOfLines={2}>
                  {stop.locationName}
                </Text>
                <Text style={[styles.calloutSubtitle, { color: theme.textSecondary }]}>
                  {stop.stopType === 'pickup' ? 'Pickup' : stop.stopType === 'dropoff' ? 'Dropoff' : 'Stop'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Status Indicators */}
      {isActiveTrip && (
        <View style={[styles.statusBar, { top: insets.top + spacing.md }]}>
          {lastUpdateTime && (
            <View style={[styles.statusItem, { backgroundColor: theme.card }, shadows.sm]}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                {formatTimeAgo(lastUpdateTime)}
              </Text>
            </View>
          )}
          {driverLocation?.coords.speed && (
            <View style={[styles.statusItem, { backgroundColor: theme.card }, shadows.sm]}>
              <Ionicons 
                name={driverLocation.coords.speed * 3.6 > 5 ? "car" : "pause-circle"} 
                size={16} 
                color={driverLocation.coords.speed * 3.6 > 5 ? theme.primary : theme.textSecondary} 
              />
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                {driverLocation.coords.speed * 3.6 > 5 
                  ? `Moving (${Math.round(driverLocation.coords.speed * 3.6)} km/h)`
                  : 'Stopped'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Re-center Button */}
      {!isFollowing && driverLocation && (
        <TouchableOpacity
          style={[
            styles.reCenterButton,
            {
              backgroundColor: theme.card,
              top: insets.top + spacing.md + 50,
              ...shadows.md,
            },
          ]}
          onPress={() => {
            setIsFollowing(true);
            setUserHasInteracted(false);
            if (mapRef.current && driverLocation) {
              const region: Region = {
                latitude: driverLocation.coords.latitude,
                longitude: driverLocation.coords.longitude,
                latitudeDelta: currentRegionRef.current?.latitudeDelta || 0.01,
                longitudeDelta: currentRegionRef.current?.longitudeDelta || 0.01,
              };
              mapRef.current.animateToRegion(region, 1000);
              currentRegionRef.current = region;
            }
          }}
        >
          <Ionicons name="locate" size={20} color={theme.primary} />
          <Text style={[styles.reCenterText, { color: theme.text }]}>Re-center</Text>
        </TouchableOpacity>
      )}

      {/* Floating End Trip Button */}
      <TouchableOpacity
        style={[
          styles.endTripButton,
          {
            backgroundColor: theme.error || '#EF4444',
            bottom: insets.bottom + tabBar.height + spacing.lg,
            ...shadows.lg,
          },
          endTripMutation.isPending && styles.endTripButtonDisabled,
        ]}
        onPress={handleEndTrip}
        disabled={endTripMutation.isPending}
      >
        {endTripMutation.isPending ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.endTripButtonText}>Ending Trip...</Text>
          </>
        ) : (
          <>
            <Ionicons name="stop-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.endTripButtonText}>End Trip</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Trip Report Modal */}
      <TripReportModal
        isVisible={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          reportReservationIdRef.current = null; // Clear ref when modal closes
        }}
        onSubmit={handleSubmitReport}
        isLoading={submitReportMutation.isPending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
  },
  emptyStateContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyStateCard: {
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  calloutContainer: {
    padding: spacing.sm,
    minWidth: 150,
    maxWidth: 250,
  },
  calloutTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  calloutSubtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
  endTripButton: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  endTripButtonDisabled: {
    opacity: 0.6,
  },
  endTripButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  driverMarkerContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadows.lg,
  },
  statusBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    zIndex: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  reCenterButton: {
    position: 'absolute',
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    zIndex: 10,
  },
  reCenterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
