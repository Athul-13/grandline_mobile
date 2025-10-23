import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, logoutUser, getCurrentUser } from '../../store';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  
  // Get user data from Redux state
  const { user } = useAppSelector((state) => state.auth);

  // Load user data when component mounts
  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

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
              await dispatch(logoutUser()).unwrap();
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

  // Get user's first name for welcome message
  const getWelcomeMessage = () => {
    if (!user) return 'Welcome to GrandLine!';
    return `Welcome back, ${user.firstName}!`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
          {user ? `Ready to start driving, ${user.firstName}?` : 'Loading your dashboard...'}
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
    paddingBottom: 100, // Space for floating tab bar
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
