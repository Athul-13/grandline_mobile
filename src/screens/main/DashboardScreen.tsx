import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, logoutUser, getCurrentUser } from '../../store';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  
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
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/mainpage-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            {getWelcomeMessage()}
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {user ? `Ready to start driving, ${user.firstName}?` : 'Loading your dashboard...'}
          </Text>
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(main)/profile')}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F4F1DE',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#C5630C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
