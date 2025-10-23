import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageBackground, ScrollView, Alert } from 'react-native';
import { useAppDispatch, useAppSelector, logoutUser, getCurrentUser } from '../../store';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  
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
            } catch {
              // Even if logout fails, continue
            }
          }
        }
      ]
    );
  };

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Settings
        </Text>
      </View>
      
      <View style={styles.content}>
          <View style={styles.profileCard}>
            {/* User Avatar */}
            {user?.avatar ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </Text>
              </View>
            )}

            {/* Full Name */}
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Name:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              {getFullName()}
            </Text>
            
            {/* Email */}
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Email:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              {user?.email || 'Loading...'}
            </Text>
            
            {/* Phone Number */}
            {user?.phoneNumber && (
              <>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Phone:
                </Text>
                <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {user.phoneNumber}
                </Text>
              </>
            )}
            
            {/* Status */}
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Status:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              {getStatus()}
            </Text>
            
            {/* Member Since */}
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Member Since:
            </Text>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].text }]}>
              {user ? formatDate(user.createdAt) : 'Loading...'}
            </Text>

            {/* Onboarding Status */}
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Onboarding:
            </Text>
            <Text style={[
              styles.value, 
              { 
                color: user?.isOnboardingComplete ? '#4CAF50' : '#FF9800',
                fontWeight: 'bold'
              }
            ]}>
              {user?.isOnboardingComplete ? 'Completed' : 'Pending'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1DE',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    transform: [{ translateX: -10 }],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#C5630C',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C5630C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C5630C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderColor: '#C5630C',
    borderWidth: 2,
  },
  logoutButtonText: {
    color: '#C5630C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
