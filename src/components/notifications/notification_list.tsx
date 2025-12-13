import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import type { Notification } from '../../types/notifications';
import { NotificationItem } from './notification_item';

/**
 * Notification List Props
 */
interface NotificationListProps {
  notifications: Notification[];
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  onNotificationPress?: (notification: Notification) => void;
}

/**
 * Notification List Component
 * Displays a list of notifications
 */
export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onRefresh,
  refreshing = false,
  onNotificationPress,
}) => {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={() => onNotificationPress?.(item)}
    />
  );

  return (
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item.notificationId}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {/* Empty state will be handled by parent */}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
  },
});

