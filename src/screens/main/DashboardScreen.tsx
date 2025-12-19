import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyTripState } from '../../components/trips/empty_trip_state';
import { TripListItem } from '../../components/trips/trip_list_item';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { useDriverDashboard } from '../../hooks/driver';
import { useTheme } from '../../hooks/use-theme';

/**
 * Backend Pagination Contract (Verified):
 * - Upcoming Trips: Returns ALL trips in a single array (no pagination metadata)
 *   → Use client-side progressive rendering
 * - Past Trips: Returns { items, nextCursor, hasMore } with server-side pagination
 *   → Use React Query's infinite query (already configured)
 */
const INITIAL_UPCOMING_LIMIT = 3;
const UPCOMING_INCREMENT = 3;

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dashboardQuery = useDriverDashboard({ pastLimit: 10 });

  // Client-side progressive rendering for Upcoming Trips
  const [upcomingVisibleCount, setUpcomingVisibleCount] = useState(INITIAL_UPCOMING_LIMIT);

  const handleTripPress = (reservationId: string) => {
    router.push({
      pathname: '/(main)/(dashboard)/trip-detail',
      params: { reservationId },
    });
  };

  const firstPage = dashboardQuery.data?.pages?.[0];
  const currentTrip = firstPage?.currentTrip ?? null;
  const allUpcomingTrips = firstPage?.upcomingTrips ?? [];
  const pastTrips = dashboardQuery.data?.pages?.flatMap((p) => p.pastTrips.items) ?? [];

  // Client-side progressive rendering: show first N, then increment on "View more"
  const visibleUpcomingTrips = allUpcomingTrips.slice(0, upcomingVisibleCount);
  const hasMoreUpcoming = allUpcomingTrips.length > upcomingVisibleCount;

  const handleViewMoreUpcoming = () => {
    setUpcomingVisibleCount((prev) => prev + UPCOMING_INCREMENT);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
        {/* Loading State */}
        {dashboardQuery.isLoading && !dashboardQuery.data && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading your trips…
            </Text>
          </View>
        )}

        {/* Error State */}
        {dashboardQuery.isError && (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, { color: theme.text }]}>
              Failed to load trips.
            </Text>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.primary }]}
              onPress={() => dashboardQuery.refetch()}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!dashboardQuery.isLoading && !dashboardQuery.isError && (
          <>
            {/* Current Trip Section */}
            <View style={styles.section}>
              {currentTrip ? (
                <TripListItem
                  trip={currentTrip}
                  isCurrent
                  onPress={() => handleTripPress(currentTrip.reservationId)}
                />
              ) : (
                <EmptyTripState
                  title="No active trip"
                  subtitle="You don't have any trips in progress right now"
                  icon="time-outline"
                />
              )}
            </View>

            {/* Upcoming Trips Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Upcoming Trips
              </Text>
              {allUpcomingTrips.length > 0 ? (
                <>
                  {visibleUpcomingTrips.map((trip) => (
                    <TripListItem
                      key={trip.reservationId}
                      trip={trip}
                      onPress={() => handleTripPress(trip.reservationId)}
                    />
                  ))}
                  {hasMoreUpcoming && (
                    <TouchableOpacity
                      style={[styles.loadMoreButton, { borderColor: theme.primary }]}
                      onPress={handleViewMoreUpcoming}
                    >
                      <Text style={[styles.loadMoreButtonText, { color: theme.primary }]}>
                        View More Upcoming Trips
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <EmptyTripState
                  title="No upcoming trips"
                  subtitle="You don't have any scheduled trips"
                  icon="calendar-outline"
                />
              )}
            </View>

            {/* Past Trips Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Past Trips
              </Text>
              {pastTrips.length > 0 ? (
                <>
                  {pastTrips.map((trip) => (
                    <TripListItem
                      key={trip.reservationId}
                      trip={trip}
                      onPress={() => handleTripPress(trip.reservationId)}
                    />
                  ))}
                  {/* Server-side pagination: show button when backend indicates more data */}
                  {dashboardQuery.hasNextPage && (
                    <TouchableOpacity
                      style={[styles.loadMoreButton, { borderColor: theme.primary }]}
                      onPress={() => dashboardQuery.fetchNextPage()}
                      disabled={dashboardQuery.isFetchingNextPage}
                    >
                      {dashboardQuery.isFetchingNextPage ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                      ) : (
                        <Text style={[styles.loadMoreButtonText, { color: theme.primary }]}>
                          View More Past Trips
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <EmptyTripState
                  title="No past trips"
                  subtitle="Your completed trips will appear here"
                  icon="checkmark-circle-outline"
                />
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  content: {
    width: '100%',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
  },
  errorBox: {
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  loadMoreButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loadMoreButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
