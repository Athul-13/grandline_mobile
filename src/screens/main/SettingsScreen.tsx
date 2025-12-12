import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../store/hooks';
import { useLogout } from '../../hooks/auth';
import { useProfileQuery } from '../../hooks/profile';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const logoutMutation = useLogout();
  
  // Get user data from React Query
  const { data: user, error } = useProfileQuery();

  // Show error alert if user data fails to load
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        'Failed to load profile data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [error]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              router.replace('/(auth)/login');
            } catch {
              // Even if logout fails, navigate to login
              router.replace('/(auth)/login');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* User Avatar */}
        {user?.avatar ? (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
            </Text>
          </View>
        )}

        <Text style={[styles.greeting, { color: theme.text }]}>
          {user?.firstName || 'User'} {user?.lastName || ''}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      {/* Settings Sections */}
      <View style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Account
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/(settings)/profile')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="person-outline" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>
                  Profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/(settings)/notifications')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="notifications-outline" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>
                  Notifications
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Support
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/(settings)/report-issue')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="alert-circle-outline" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>
                  Report an Issue
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: theme.primary }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.primary} style={styles.logoutIcon} />
          <Text style={[styles.logoutButtonText, { color: theme.primary }]}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.version, { color: theme.textSecondary }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: 'white',
    fontSize: typography.sizes.xxxl + 4,
    fontWeight: typography.weights.bold,
  },
  greeting: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  email: {
    fontSize: typography.sizes.sm + 1,
    textAlign: 'center',
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
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
    overflow: 'hidden',
    ...shadows.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemLeft: {
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
  menuItemText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    paddingVertical: 15,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  logoutIcon: {
    marginRight: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.sizes.xs + 1,
    marginTop: spacing.lg,
    opacity: 0.4,
  },
});