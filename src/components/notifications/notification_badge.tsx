import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

/**
 * Notification Badge Props
 */
interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  showZero?: boolean;
}

/**
 * Notification Badge Component
 * Displays unread notification count
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  showZero = false,
}) => {
  const { theme } = useTheme();

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[styles.badge, { backgroundColor: theme.primary }]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});

