import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { useLogout } from '../../hooks/auth';
import { useTheme } from '../../hooks/use-theme';
import { useAppSelector } from '../../store/hooks';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const logoutMutation = useLogout();
  const insets = useSafeAreaInsets();
  
  // Get driver data from Redux
  const driver = useAppSelector((state) => state.auth.driver);

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

  // Get driver's name for welcome message
  const getWelcomeMessage = () => {
    if (!driver) return 'Welcome to GrandLine!';
    // Extract first name from fullName
    const firstName = driver.fullName.split(' ')[0];
    return `Welcome back, ${firstName}!`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom + 100 }]}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/mainpage-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>
          {getWelcomeMessage()}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {driver ? `Ready to start driving, ${driver.fullName.split(' ')[0]}?` : 'Loading your dashboard...'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: theme.primary }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.primary} style={styles.logoutIcon} />
          <Text style={[styles.logoutButtonText, { color: theme.primary }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: spacing.md + 4,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    width: '100%',
    maxWidth: 300,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.lg + 6,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
