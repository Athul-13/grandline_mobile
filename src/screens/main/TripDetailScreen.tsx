/**
 * Trip Detail Screen
 * Displays detailed information about a driver's trip/reservation
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useDriverReservation } from '../../hooks/driver/use_driver_reservation';
import { useTheme } from '../../hooks/use-theme';

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
 * Format distance (meters to km, rounded to 1 decimal)
 */
const formatDistance = (meters?: number): string => {
  if (!meters) return 'N/A';
  return `${(meters / 1000).toFixed(1)} km`;
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
  const reservationQuery = useDriverReservation(reservationId);

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

  // Get pickup and dropoff locations from itinerary (first and last stops)
  const pickupStop = reservation.itinerary[0];
  const dropoffStop = reservation.itinerary[reservation.itinerary.length - 1];

  // Get distance and duration from routeData
  const distance = reservation.routeData?.outbound?.totalDistance;
  const duration = reservation.routeData?.outbound?.totalDuration;

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
          </View>
        </View>

        {/* Itinerary Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ITINERARY</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Full itinerary will go here
            </Text>
          </View>
        </View>

        {/* Rider Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RIDER</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Rider information will go here
            </Text>
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>VEHICLE</Text>
          <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Vehicle details will go here
            </Text>
          </View>
        </View>
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
});

