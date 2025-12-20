/**
 * Trip Map Screen
 * Displays the route on a map with ability to switch between Outbound and Return routes
 */

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, Polyline, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useDriverReservation } from '../../hooks/driver/use_driver_reservation';
import { useTheme } from '../../hooks/use-theme';

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

export const TripMapScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ reservationId: string }>();
  const reservationId = params.reservationId || '';
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const reservationQuery = useDriverReservation(reservationId);
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');
  const [driverLocation, setDriverLocation] = useState<Coordinate | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);

  // Request location permission
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermissionGranted(true);
          const location = await Location.getCurrentPositionAsync({});
          setDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Loading state
  if (reservationQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading map...</Text>
      </View>
    );
  }

  // Error state
  if (reservationQuery.isError || !reservationQuery.data) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>Failed to load trip data.</Text>
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.primary }]}
          onPress={() => reservationQuery.refetch()}
        >
          <Text style={[styles.retryButtonText, { color: theme.primary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const reservation = reservationQuery.data;

  // Group stops by tripType
  const outboundStops = reservation.itinerary
    .filter((stop) => stop.tripType === 'outbound')
    .sort((a, b) => a.stopOrder - b.stopOrder);
  const returnStops =
    reservation.tripType === 'two_way'
      ? reservation.itinerary
          .filter((stop) => stop.tripType === 'return')
          .sort((a, b) => a.stopOrder - b.stopOrder)
      : [];

  // Get active route data
  const activeRouteData =
    activeTab === 'outbound' ? reservation.routeData?.outbound : reservation.routeData?.return;
  const activeStops = activeTab === 'outbound' ? outboundStops : returnStops;

  // Parse route geometry
  const routeCoordinates = parseRouteGeometry(activeRouteData?.routeGeometry);

  // Calculate region to fit route and stops
  const allCoordinates: Coordinate[] = [
    ...routeCoordinates,
    ...activeStops.map((stop) => ({
      latitude: stop.latitude,
      longitude: stop.longitude,
    })),
    ...(driverLocation ? [driverLocation] : []),
  ];

  const initialRegion = calculateRegion(allCoordinates);

  // Fit map to route when tab changes
  useEffect(() => {
    if (mapRef.current && allCoordinates.length > 0) {
      const region = calculateRegion(allCoordinates);
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [activeTab, reservation.routeData]);

  // Get icon for stop type
  const getStopIcon = (stopType: 'pickup' | 'stop' | 'dropoff'): keyof typeof Ionicons.glyphMap => {
    if (stopType === 'pickup') return 'location';
    if (stopType === 'dropoff') return 'flag';
    return 'ellipse';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Trip Route</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      {reservation.tripType === 'two_way' && returnStops.length > 0 && (
        <View style={[styles.tabContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'outbound' && [styles.tabActive, { backgroundColor: theme.primary }],
            ]}
            onPress={() => setActiveTab('outbound')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'outbound' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Outbound
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'return' && [styles.tabActive, { backgroundColor: theme.primary }],
            ]}
            onPress={() => setActiveTab('return')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'return' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Return
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={false}
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

        {/* Stop Markers */}
        {activeStops.map((stop) => (
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
  errorText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  retryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
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
});

