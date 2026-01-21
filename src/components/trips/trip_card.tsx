/**
 * Trip Card Component
 * Displays a single trip card with pickup/dropoff, rider, and vehicle info
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { DriverDashboardTripCard } from '../../services/api/driver_dashboard_service';

interface TripCardProps {
  trip: DriverDashboardTripCard;
  isCurrent?: boolean;
  onPress?: () => void;
  onChatPress?: () => void;
}

/**
 * Format date to readable string
 */
const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tripDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isToday = tripDate.getTime() === today.getTime();
  const isTomorrow = tripDate.getTime() === today.getTime() + 86400000;

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }) + ` at ${timeStr}`;
};

/**
 * Format status to human-readable label
 */
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    confirmed: 'Confirmed',
    modified: 'Modified',
    cancelled: 'Cancelled',
    completed: 'Completed',
    refunded: 'Refunded',
  };
  return statusMap[status] || status;
};

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  isCurrent = false,
  onPress,
  onChatPress,
}) => {
  const { theme } = useTheme();

  // Show chat icon only for CURRENT or UPCOMING trips with chat enabled
  const showChatIcon =
    (trip.tripState === 'CURRENT' || trip.tripState === 'UPCOMING') &&
    trip.messaging.chatEnabled;

  const cardContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrent ? theme.primary : theme.card,
          borderColor: isCurrent ? theme.primary : theme.border,
        },
        shadows.md,
      ]}
    >
      {/* Header with status badge and chat icon */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isCurrent && (
            <View style={[styles.currentBadge, { backgroundColor: '#FFFFFF' }]}>
              <Ionicons name="radio-button-on" size={12} color={theme.primary} />
              <Text style={[styles.currentBadgeText, { color: theme.primary }]}>
                Active
              </Text>
            </View>
          )}
          {!isCurrent && (
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {formatStatus(trip.status)}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.timeText, { color: isCurrent ? '#FFFFFF' : theme.textSecondary }]}>
            {formatDateTime(trip.tripStartAt)}
          </Text>
          {showChatIcon && (
            <TouchableOpacity
              style={styles.chatIconButton}
              onPress={onChatPress || (() => {})}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={isCurrent ? '#FFFFFF' : theme.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.routeStop}>
          <View style={[styles.stopIcon, { backgroundColor: isCurrent ? '#FFFFFF' : theme.primaryLight }]}>
            <Ionicons
              name="location"
              size={16}
              color={isCurrent ? theme.primary : theme.primary}
            />
          </View>
          <View style={styles.stopContent}>
            <Text style={[styles.stopLabel, { color: isCurrent ? '#FFFFFF' : theme.text }]} numberOfLines={2}>
              {trip.pickup.label}
            </Text>
            <Text style={[styles.stopTime, { color: isCurrent ? '#FFFFFF' : theme.textSecondary }]}>
              {formatDateTime(trip.pickup.time)}
            </Text>
          </View>
        </View>

        <View style={[styles.routeLine, { backgroundColor: isCurrent ? '#FFFFFF' : theme.border }]} />

        <View style={styles.routeStop}>
          <View style={[styles.stopIcon, { backgroundColor: isCurrent ? '#FFFFFF' : theme.primaryLight }]}>
            <Ionicons
              name="location"
              size={16}
              color={isCurrent ? theme.primary : theme.primary}
            />
          </View>
          <View style={styles.stopContent}>
            <Text style={[styles.stopLabel, { color: isCurrent ? '#FFFFFF' : theme.text }]} numberOfLines={2}>
              {trip.dropoff.label}
            </Text>
            <Text style={[styles.stopTime, { color: isCurrent ? '#FFFFFF' : theme.textSecondary }]}>
              {formatDateTime(trip.dropoff.time)}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: isCurrent ? '#FFFFFF' : theme.divider }]} />

      {/* Rider Info */}
      <View style={styles.riderRow}>
        <View style={styles.riderLeft}>
          <Ionicons
            name="person-outline"
            size={18}
            color={isCurrent ? '#FFFFFF' : theme.textSecondary}
          />
          <Text style={[styles.riderLabel, { color: isCurrent ? '#FFFFFF' : theme.textSecondary }]}>
            Rider:
          </Text>
          <Text style={[styles.riderName, { color: isCurrent ? '#FFFFFF' : theme.text }]}>
            {trip.rider.fullName}
          </Text>
        </View>
        {trip.rider.privacy === 'FULL' && (
          <View style={styles.riderContact}>
            {trip.rider.phoneNumber && (
              <Ionicons
                name="call-outline"
                size={16}
                color={isCurrent ? '#FFFFFF' : theme.textSecondary}
              />
            )}
            {trip.rider.email && (
              <Ionicons
                name="mail-outline"
                size={16}
                color={isCurrent ? '#FFFFFF' : theme.textSecondary}
              />
            )}
          </View>
        )}
      </View>

      {/* Vehicles */}
      {trip.vehicles.length > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: isCurrent ? '#FFFFFF' : theme.divider }]} />
          <View style={styles.vehiclesRow}>
            <Ionicons
              name="car-outline"
              size={18}
              color={isCurrent ? '#FFFFFF' : theme.textSecondary}
            />
            <Text style={[styles.vehiclesLabel, { color: isCurrent ? '#FFFFFF' : theme.textSecondary }]}>
              Vehicles:
            </Text>
            <Text style={[styles.vehiclesText, { color: isCurrent ? '#FFFFFF' : theme.text }]}>
              {trip.vehicles.map((v) => `${v.vehicleModel}${v.quantity > 1 ? ` (x${v.quantity})` : ''}`).join(', ')}
            </Text>
          </View>
        </>
      )}

    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeText: {
    fontSize: typography.sizes.xs,
  },
  chatIconButton: {
    padding: spacing.xs,
  },
  route: {
    marginBottom: spacing.md,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stopIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stopContent: {
    flex: 1,
  },
  stopLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  stopTime: {
    fontSize: typography.sizes.xs,
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 15,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  riderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  riderLabel: {
    fontSize: typography.sizes.sm,
  },
  riderName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  riderContact: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  vehiclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  vehiclesLabel: {
    fontSize: typography.sizes.sm,
  },
  vehiclesText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
});

