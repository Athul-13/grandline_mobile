import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();

  // Dummy notification data
  const notifications = [
    {
      id: '1',
      title: 'Welcome to GrandLine!',
      message: 'Your account has been successfully created.',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      title: 'Driver License Approved',
      message: 'Your driver\'s license has been verified and approved.',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: '3',
      title: 'Profile Update Required',
      message: 'Please complete your profile information to continue.',
      time: '3 days ago',
      isRead: true,
    },
    {
      id: '4',
      title: 'New Feature Available',
      message: 'Check out our new route optimization feature!',
      time: '1 week ago',
      isRead: true,
    },
    {
      id: '5',
      title: 'Account Security',
      message: 'Your password was changed successfully.',
      time: '2 weeks ago',
      isRead: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Notifications
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <View 
            key={notification.id} 
            style={[
              styles.notificationCard,
              { 
                backgroundColor: theme.card,
                ...shadows.md,
              },
              !notification.isRead && { 
                borderLeftWidth: 4,
                borderLeftColor: theme.primary 
              }
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={[
                styles.notificationTitle,
                { color: theme.text }
              ]}>
                {notification.title}
              </Text>
              <Text style={[
                styles.notificationTime,
                { color: theme.textSecondary }
              ]}>
                {notification.time}
              </Text>
            </View>
            <Text style={[
              styles.notificationMessage,
              { color: theme.textSecondary }
            ]}>
              {notification.message}
            </Text>
            {!notification.isRead && (
              <View style={[styles.unreadIndicator, { backgroundColor: theme.primary }]} />
            )}
          </View>
        ))}
        
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[
              styles.emptyText,
              { color: theme.textSecondary }
            ]}>
              No notifications yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for floating tab bar
  },
  notificationCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
    borderLeftWidth: 0,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: spacing.sm + 2,
  },
  notificationTime: {
    fontSize: typography.sizes.xs,
  },
  notificationMessage: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: borderRadius.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
  },
});
