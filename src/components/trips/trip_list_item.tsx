/**
 * Trip List Item Component
 * Dashboard list item for displaying trips in a compact, list-like format
 * Shows: date/time, truncated locations, and conditional chat icon
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { DriverDashboardTripCard } from '../../services/api/driver_dashboard_service';

interface TripListItemProps {
  trip: DriverDashboardTripCard;
  isCurrent?: boolean;
  onPress?: () => void;
  onChatPress?: () => void;
}

/**
 * Format date to compact dashboard format (e.g., "Tomorrow · 10:00 AM")
 */
const formatCompactDateTime = (isoString: string): string => {
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
    return `Today · ${timeStr}`;
  }
  if (isTomorrow) {
    return `Tomorrow · ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return `${dateStr} · ${timeStr}`;
};

/**
 * Truncate location label to fit in list item
 * Shows first part of location, ellipsis if too long
 */
const truncateLocation = (label: string, maxLength: number = 25): string => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + '...';
};

export const TripListItem: React.FC<TripListItemProps> = ({
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

  const pickupLabel = truncateLocation(trip.pickup.label);
  const dropoffLabel = truncateLocation(trip.dropoff.label);

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
      {/* Header with date/time and chat icon */}
      <View style={styles.header}>
        <Text
          style={[
            styles.dateTime,
            { color: isCurrent ? '#FFFFFF' : theme.textSecondary },
          ]}
        >
          {formatCompactDateTime(trip.tripStartAt)}
        </Text>
        {showChatIcon && (
          <TouchableOpacity
            style={styles.chatIconButton}
            onPress={onChatPress || (() => {})}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={isCurrent ? '#FFFFFF' : theme.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Route: Pickup → Dropoff (truncated) */}
      <View style={styles.routeContainer}>
        <Text
          style={[
            styles.routeLabel,
            { color: isCurrent ? '#FFFFFF' : theme.text },
          ]}
          numberOfLines={1}
        >
          {pickupLabel} → {dropoffLabel}
        </Text>
      </View>
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
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateTime: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  chatIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  routeContainer: {
    marginTop: spacing.xs,
  },
  routeLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});

