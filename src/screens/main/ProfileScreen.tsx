import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, getCurrentUser } from '../../store';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  
  // Get user data from Redux state
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  // Load user data when component mounts
  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

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

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get user's full name
  const getFullName = () => {
    if (!user) return 'Loading...';
    return `${user.firstName} ${user.lastName}`;
  };

  // Get status text
  const getStatus = () => {
    if (!user) return 'Loading...';
    if (user.isEmailVerified && user.isOnboardingComplete) {
      return 'Active';
    } else if (user.isEmailVerified) {
      return 'Email Verified';
    } else {
      return 'Pending Verification';
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {user?.avatar ? (
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user.avatar }} 
                style={[styles.avatar, { borderColor: theme.primary }]} 
              />
            </View>
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
              </Text>
            </View>
          )}
          <Text style={[styles.userName, { color: theme.text }]}>
            {getFullName()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${theme.primary}1A` }]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: user?.isOnboardingComplete ? theme.success : theme.warning }
            ]} />
            <Text style={[styles.statusText, { color: theme.primary }]}>{getStatus()}</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Personal Information
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="mail-outline" size={18} color={theme.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Email
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {user?.email || 'Loading...'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Phone Number */}
            {user?.phoneNumber && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="call-outline" size={18} color={theme.primary} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                        Phone
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {user.phoneNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Member Since */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Member Since
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {user ? formatDate(user.createdAt) : 'Loading...'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Onboarding Status */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={theme.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Onboarding
                  </Text>
                  <Text style={[
                    styles.infoValue, 
                    { 
                      color: user?.isOnboardingComplete ? theme.success : theme.warning,
                      fontWeight: typography.weights.semibold
                    }
                  ]}>
                    {user?.isOnboardingComplete ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Actions
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => {
                Alert.alert('Coming Soon', 'Update driver\'s license functionality will be available soon.');
              }}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="card-outline" size={18} color={theme.primary} />
                </View>
                <Text style={[styles.actionText, { color: theme.text }]}>
                  Update Driver's License
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => router.push('/(auth)/password-change')}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.primary} />
                </View>
                <Text style={[styles.actionText, { color: theme.text }]}>
                  Change Password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
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
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.lg + 6,
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
  userName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.md + 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    marginRight: 6,
  },
  statusText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
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
    fontWeight: typography.weights.medium,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});