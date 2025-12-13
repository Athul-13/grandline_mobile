import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { Notification } from '../../types/notifications';

/**
 * Notification Item Props
 */
interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

/**
 * Format date to relative time
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

/**
 * Notification Item Component
 * Displays a single notification
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderLeftColor: notification.isRead ? 'transparent' : theme.primary,
        },
        !notification.isRead && styles.unread,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {notification.title}
          </Text>
          {!notification.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
          )}
        </View>
        <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={3}>
          {notification.message}
        </Text>
        <Text style={[styles.time, { color: theme.textSecondary }]}>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  unread: {
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  message: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});

