import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useDriverProfileQuery } from '../../hooks/driver';
import { useTheme } from '../../hooks/use-theme';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Get driver data from React Query
  const { data: driver, error } = useDriverProfileQuery();

  // Show error alert if driver data fails to load
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

  // Get driver's full name
  const getFullName = () => {
    if (!driver) return 'Loading...';
    return driver.fullName;
  };

  // Get status text based on driver status
  const getStatus = () => {
    if (!driver) return 'Loading...';
    if (driver.isOnboarded && driver.status === 'available') {
      return 'Active';
    } else if (driver.isOnboarded) {
      return 'Onboarded';
    } else {
      return 'Pending Onboarding';
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
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          {driver?.profilePictureUrl ? (
            <View style={styles.profilePictureContainer}>
              <Image 
                source={{ uri: driver.profilePictureUrl }} 
                style={[styles.profilePicture, { borderColor: theme.primary }]} 
              />
            </View>
          ) : (
            <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.profilePictureText}>
                {driver ? driver.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'D'}
              </Text>
            </View>
          )}
          <Text style={[styles.driverName, { color: theme.text }]}>
            {getFullName()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${theme.primary}1A` }]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: driver?.isOnboarded ? theme.success : theme.warning }
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
                    {driver?.email || 'Loading...'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Phone Number */}
            {driver?.phoneNumber && (
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
                        {driver.phoneNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* License Number */}
            {driver?.licenseNumber && (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="card-outline" size={18} color={theme.primary} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                        License Number
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {driver.licenseNumber}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              </>
            )}

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
                    {driver ? formatDate(driver.createdAt) : 'Loading...'}
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
                      color: driver?.isOnboarded ? theme.success : theme.warning,
                      fontWeight: typography.weights.semibold
                    }
                  ]}>
                    {driver?.isOnboarded ? 'Completed' : 'Pending'}
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
                  Update Driver&apos;s License
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => router.push('/(main)/(settings)/change-password')}
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
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: spacing.lg + 6,
  },
  profilePictureContainer: {
    marginBottom: spacing.md,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    borderWidth: 3,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profilePictureText: {
    color: 'white',
    fontSize: typography.sizes.xxxl + 4,
    fontWeight: typography.weights.bold,
  },
  driverName: {
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