import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Notifications
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <View 
            key={notification.id} 
            style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadCard
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={[
                styles.notificationTitle,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                {notification.title}
              </Text>
              <Text style={[
                styles.notificationTime,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                {notification.time}
              </Text>
            </View>
            <Text style={[
              styles.notificationMessage,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              {notification.message}
            </Text>
            {!notification.isRead && (
              <View style={styles.unreadIndicator} />
            )}
          </View>
        ))}
        
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[
              styles.emptyText,
              { color: Colors[colorScheme ?? 'light'].text }
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
    backgroundColor: '#F4F1DE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#C5630C',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#C5630C',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5630C',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
