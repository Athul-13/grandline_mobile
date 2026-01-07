/**
 * Trip Detail Screen
 * Displays detailed information about a driver's trip/reservation
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useStartTrip } from '../../hooks/driver';
import { useDriverReservation } from '../../hooks/driver/use_driver_reservation';
import { useTheme } from '../../hooks/use-theme';
import { formatTimeAgo } from '../../utils/time_format';

/**
 * Derive trip state from dates (for display only)
 */
const getTripState = (tripStartAt: string, tripEndAt: string): 'CURRENT' | 'UPCOMING' | 'PAST' => {
  const now = new Date();
  const start = new Date(tripStartAt);
  const end = new Date(tripEndAt);

  if (end.getTime() < now.getTime()) {
    return 'PAST';
  }
  if (start.getTime() > now.getTime()) {
    return 'UPCOMING';
  }
  return 'CURRENT';
};

/**
 * Format date and time for display (e.g., "8 Jan · 5:00 AM")
 */
const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} · ${timeStr}`;
};

/**
 * Format distance (already in km, rounded to 1 decimal)
 */
const formatDistance = (kilometers?: number): string => {
  if (!kilometers) return 'N/A';
  return `${kilometers.toFixed(1)} km`;
};

/**
 * Format duration (seconds to hours/minutes, human readable)
 */
const formatDuration = (seconds?: number): string => {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

/**
 * Truncate location name to 1-2 meaningful words
 */
const truncateLocation = (locationName: string): string => {
  const words = locationName.split(',').map((w) => w.trim());
  // Take first 1-2 words from the first part (usually city/area name)
  if (words.length > 0) {
    const firstPart = words[0].split(' ');
    if (firstPart.length <= 2) {
      return firstPart.join(' ');
    }
    return firstPart.slice(0, 2).join(' ');
  }
  return locationName;
};

/**
 * Get icon name for stop type
 */
const getStopTypeIcon = (stopType: 'pickup' | 'stop' | 'dropoff'): keyof typeof Ionicons.glyphMap => {
  if (stopType === 'pickup') return 'location-outline';
  if (stopType === 'dropoff') return 'flag-outline';
  return 'ellipse-outline';
};

/**
 * Format time for display (e.g., "05:00")
 */
const formatTimeOnly = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Get status badge background color
 */
const getStatusBadgeColor = (tripState: 'CURRENT' | 'UPCOMING' | 'PAST', theme: any): string => {
  if (tripState === 'CURRENT') {
    return `${theme.success}1A`; // 10% opacity
  }
  if (tripState === 'UPCOMING') {
    return `${theme.info}1A`;
  }
  return `${theme.textSecondary}1A`;
};

/**
 * Get status dot color
 */
const getStatusDotColor = (tripState: 'CURRENT' | 'UPCOMING' | 'PAST', theme: any): string => {
  if (tripState === 'CURRENT') {
    return theme.success;
  }
  if (tripState === 'UPCOMING') {
    return theme.info;
  }
  return theme.textSecondary;
};

/**
 * Get status text color
 */
const getStatusTextColor = (tripState: 'CURRENT' | 'UPCOMING' | 'PAST', theme: any): string => {
  if (tripState === 'CURRENT') {
    return theme.success;
  }
  if (tripState === 'UPCOMING') {
    return theme.info;
  }
  return theme.textSecondary;
};

export const TripDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ reservationId: string }>();
  const reservationId = params.reservationId || '';
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const reservationQuery = useDriverReservation(reservationId);
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');
  const startTripMutation = useStartTrip();

  // Refetch reservation data when screen comes into focus
  // Mark query as stale first to force a refetch even if data is considered fresh
  useFocusEffect(
    useCallback(() => {
      if (reservationId) {
        // Mark the query as stale to force a refetch
        queryClient.invalidateQueries({ 
          queryKey: ['driver', 'reservation', reservationId] 
        });
        // Then refetch to get the latest data
        reservationQuery.refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reservationId, queryClient])
  );

  // Loading state
  if (reservationQuery.isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading trip details…
        </Text>
      </View>
    );
  }

  // Error state
  if (reservationQuery.isError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Failed to load trip details.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.primary }]}
          onPress={() => reservationQuery.refetch()}
        >
          <Text style={[styles.retryButtonText, { color: theme.primary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Success state - render scaffold
  const reservation = reservationQuery.data;

  if (!reservation) {
    return null;
  }

  // Derive trip state for display
  const tripState = getTripState(reservation.tripStartAt, reservation.tripEndAt);
  const tripStateLabel = tripState === 'CURRENT' ? 'Current' : tripState === 'UPCOMING' ? 'Upcoming' : 'Past';

  // Determine if Start Trip button should be shown
  const canStartTrip = !reservation.startedAt && !reservation.completedAt && tripState === 'CURRENT';
  
  // Determine if trip is in progress (started but not completed)
  const isTripInProgress = !!reservation.startedAt && !reservation.completedAt;

  // Handle Start Trip
  const handleStartTrip = async () => {
    try {
      await startTripMutation.mutateAsync(reservationId);
      // Navigate to Map tab after starting trip
      router.replace('/(main)/(map)');
    } catch (error: any) {
      // Check if error is "Trip has already been started"
      // In this case, the trip is already started, so we should navigate to map
      const errorMessage = error?.message || error?.data?.message || '';
      const isAlreadyStarted = 
        errorMessage.toLowerCase().includes('already been started') ||
        errorMessage.toLowerCase().includes('already started');

      if (isAlreadyStarted) {
        // Trip is already started - navigate to map instead of showing error
        router.replace('/(main)/(map)');
        return;
      }

      // For other errors, log them (error handling is done by React Query)
      console.error('Failed to start trip:', error);
    }
  };
  
  // Handle View on Map
  const handleViewOnMap = () => {
    router.replace('/(main)/(map)');
  };
  
  // Format started time for display
  const getStartedTimeText = (): string => {
    if (!reservation.startedAt) return '';
    const startedTime = new Date(reservation.startedAt).getTime();
    return formatTimeAgo(startedTime);
  };

  // Get pickup and dropoff locations from itinerary (first and last stops)
  const pickupStop = reservation.itinerary[0];
  const dropoffStop = reservation.itinerary[reservation.itinerary.length - 1];

  // Get distance and duration from routeData
  const distance = reservation.routeData?.outbound?.totalDistance;
  const duration = reservation.routeData?.outbound?.totalDuration;

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

  // Determine which stops to show based on active tab
  const activeStops = activeTab === 'outbound' ? outboundStops : returnStops;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Trip Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Trip Overview Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            TRIP OVERVIEW
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            {/* Header with Trip Name and Status Badge */}
            <View style={styles.tripOverviewHeader}>
              {reservation.tripName && (
                <Text style={[styles.tripName, { color: theme.text }]} numberOfLines={2}>
                  {reservation.tripName}
                </Text>
              )}
              <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(tripState, theme) }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusDotColor(tripState, theme) }]} />
                <Text style={[styles.statusBadgeText, { color: getStatusTextColor(tripState, theme) }]}>
                  {tripStateLabel}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Date & Time Section */}
            <View style={styles.tripTimingContainer}>
              <View style={styles.timingRow}>
                <View style={[styles.timingIconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                </View>
                <View style={styles.timingContent}>
                  <Text style={[styles.timingLabel, { color: theme.textSecondary }]}>
                    Start
                  </Text>
                  <Text style={[styles.timingValue, { color: theme.text }]}>
                    {formatDateTime(reservation.tripStartAt)}
                  </Text>
                </View>
              </View>

              <View style={[styles.timingDivider, { backgroundColor: theme.divider }]} />

              <View style={styles.timingRow}>
                <View style={[styles.timingIconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                </View>
                <View style={styles.timingContent}>
                  <Text style={[styles.timingLabel, { color: theme.textSecondary }]}>
                    End
                  </Text>
                  <Text style={[styles.timingValue, { color: theme.text }]}>
                    {formatDateTime(reservation.tripEndAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Route Summary Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ROUTE SUMMARY</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            {/* Pickup → Dropoff (single line) */}
            <View style={styles.routeSummaryRow}>
              <Text style={[styles.routeSummaryText, { color: theme.text }]} numberOfLines={1}>
                {truncateLocation(pickupStop?.locationName || 'Pickup')} → {truncateLocation(dropoffStop?.locationName || 'Dropoff')}
              </Text>
            </View>

            {/* Distance · Duration */}
            {(distance || duration) && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.routeSummaryRow}>
                  <Text style={[styles.routeSummaryMeta, { color: theme.textSecondary }]}>
                    {distance ? formatDistance(distance) : ''}
                    {distance && duration ? ' · ' : ''}
                    {duration ? formatDuration(duration) : ''}
                  </Text>
                </View>
              </>
            )}

            {/* View on Map Button */}
            {reservation.routeData && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/(dashboard)/trip-map',
                      params: { reservationId: reservation.reservationId },
                    });
                  }}
                >
                  <Ionicons name="map-outline" size={20} color={theme.primary} />
                  <Text style={[styles.mapButtonText, { color: theme.primary }]}>View route on map</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Itinerary Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ITINERARY</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            {reservation.itinerary.length === 0 ? (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                No itinerary stops available
              </Text>
            ) : (
              <>
                {/* Tabs */}
                {reservation.tripType === 'two_way' && returnStops.length > 0 && (
                  <View style={styles.tabContainer}>
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

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                  {activeStops.map((stop, index) => {
                    const isLast = index === activeStops.length - 1;
                    return (
                      <View key={stop.itineraryId} style={styles.timelineItem}>
                        {/* Timeline connector line */}
                        {!isLast && (
                          <View style={[styles.timelineConnector, { backgroundColor: theme.divider }]} />
                        )}

                        {/* Time display (left side) */}
                        <View style={styles.timelineTimeContainer}>
                          {stop.departureTime ? (
                            <>
                              <Text style={[styles.timelineTimeLabel, { color: theme.textSecondary }]}>
                                Arrival
                              </Text>
                              <Text style={[styles.timelineTime, { color: theme.primary }]}>
                                {formatTimeOnly(stop.arrivalTime)}
                              </Text>
                              <Text style={[styles.timelineTimeLabel, { color: theme.textSecondary, marginTop: 4 }]}>
                                Departure
                              </Text>
                              <Text style={[styles.timelineTime, { color: theme.primary }]}>
                                {formatTimeOnly(stop.departureTime)}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text style={[styles.timelineTimeLabel, { color: theme.textSecondary }]}>
                                Arrival
                              </Text>
                              <Text style={[styles.timelineTime, { color: theme.primary }]}>
                                {formatTimeOnly(stop.arrivalTime)}
                              </Text>
                            </>
                          )}
                        </View>

                        {/* Icon (center) */}
                        <View style={styles.timelineIconWrapper}>
                          <View style={[styles.timelineIconContainer, { backgroundColor: theme.primaryLight }]}>
                            <Ionicons name={getStopTypeIcon(stop.stopType)} size={20} color={theme.primary} />
                          </View>
                        </View>

                        {/* Location (right side) */}
                        <View style={styles.timelineContent}>
                          <Text style={[styles.timelineLocation, { color: theme.text }]} numberOfLines={2}>
                            {truncateLocation(stop.locationName)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Rider Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RIDER</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            {/* Rider Name - Always shown */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="person-outline" size={18} color={theme.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Name</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {reservation.rider.fullName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Chat with Rider Button - Only if chatEnabled */}
            {reservation.chatEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => {
                    router.push({
                      pathname: '/(main)/(settings)/chat-detail',
                      params: {
                        contextType: 'reservation',
                        contextId: reservation.reservationId,
                      },
                    });
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={theme.primary} />
                  <Text style={[styles.mapButtonText, { color: theme.primary }]}>Chat with Rider</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Email - Only if privacy is FULL */}
            {reservation.rider.privacy === 'FULL' && reservation.rider.email && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="mail-outline" size={18} color={theme.primary} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {reservation.rider.email}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Phone Number - Only if privacy is FULL */}
            {reservation.rider.privacy === 'FULL' && reservation.rider.phoneNumber && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="call-outline" size={18} color={theme.primary} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {reservation.rider.phoneNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>VEHICLE</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            {reservation.vehicles.length === 0 ? (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                No vehicle information available
              </Text>
            ) : (
              <>
                {reservation.vehicles.map((vehicle, index) => (
                  <React.Fragment key={vehicle.vehicleId}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                          <Ionicons name="car-outline" size={18} color={theme.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                            {vehicle.vehicleModel}
                          </Text>
                          <Text style={[styles.infoValue, { color: theme.text }]}>
                            {vehicle.plateNumber} {vehicle.quantity > 1 ? `×${vehicle.quantity}` : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {index < reservation.vehicles.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </View>
        </View>

        {/* Trip Actions Section - Start Trip */}
        {canStartTrip && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TRIP ACTIONS</Text>
            <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.primary },
                  startTripMutation.isPending && styles.actionButtonDisabled,
                ]}
                onPress={handleStartTrip}
                disabled={startTripMutation.isPending}
              >
                {startTripMutation.isPending ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Starting Trip...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Start Trip</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Trip Actions Section - Trip in Progress */}
        {isTripInProgress && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TRIP STATUS</Text>
            <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
              {/* Trip in Progress Status */}
              <View style={styles.tripStatusContainer}>
                <View style={[styles.tripStatusIconContainer, { backgroundColor: `${theme.success}1A` }]}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                </View>
                <View style={styles.tripStatusContent}>
                  <Text style={[styles.tripStatusTitle, { color: theme.text }]}>Trip in Progress</Text>
                  <Text style={[styles.tripStatusSubtitle, { color: theme.textSecondary }]}>
                    Started {getStartedTimeText()}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              {/* View on Map Button */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={handleViewOnMap}
              >
                <Ionicons name="map-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>View on Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
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
    paddingTop: 60,
    paddingBottom: spacing.md + 4,
    paddingHorizontal: spacing.md,
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
  content: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
    opacity: 0.6,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    overflow: 'hidden',
  },
  placeholderText: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs + 1,
    opacity: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  infoSubValue: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  routeSummaryRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  routeSummaryText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  routeSummaryMeta: {
    fontSize: typography.sizes.sm,
  },
  tripOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  tripName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    flex: 1,
    lineHeight: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.md + 4,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
  },
  tripTimingContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  timingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timingContent: {
    flex: 1,
  },
  timingLabel: {
    fontSize: typography.sizes.xs + 1,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timingValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  timingDivider: {
    height: 1,
    marginLeft: 56,
    marginVertical: spacing.xs,
  },
  itineraryContainer: {
    paddingVertical: spacing.sm,
  },
  itineraryGroup: {
    marginBottom: spacing.lg,
  },
  itineraryGroupTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
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
  timelineContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'flex-start',
    minHeight: 60,
  },
  timelineConnector: {
    position: 'absolute',
    left: 86,
    top: 40,
    width: 2,
    bottom: -spacing.md,
  },
  timelineTimeContainer: {
    width: 70,
    paddingRight: spacing.sm,
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  timelineTimeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    opacity: 0.6,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    lineHeight: 18,
  },
  timelineIconWrapper: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },
  timelineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingTop: 4,
    justifyContent: 'center',
  },
  timelineLocation: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    lineHeight: 22,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  mapButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
  tripStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tripStatusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  tripStatusContent: {
    flex: 1,
  },
  tripStatusTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: 4,
  },
  tripStatusSubtitle: {
    fontSize: typography.sizes.sm,
  },
});

