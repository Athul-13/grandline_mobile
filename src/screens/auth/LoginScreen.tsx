import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, loginUser, clearError } from '../../store';
import { LoginForm } from '../../components/screens/LoginScreen/LoginForm';
import { LoginCredentials } from '../../types/auth';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  // Get auth state from Redux
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate based on onboarding status when login is successful
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isOnboardingComplete) {
        // User has completed onboarding, go to main app
        router.replace('/(main)');
      } else {
        // User hasn't completed onboarding, go to password change first
        router.replace('/(auth)/password-change');
      }
    }
  }, [isAuthenticated, user, router]);

  // Show error alert when login fails
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Login Failed',
        error,
        [{ text: 'OK', onPress: () => dispatch(clearError()) }]
      );
    }
  }, [error, dispatch]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      // Dispatch login action
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error) {
      // Error is handled by useEffect above
      console.error('Login error:', error);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image 
                source={require('../../assets/images/mainpage-logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                Please sign in to continue
              </Text>
            </View>
            
            <LoginForm onSubmit={handleLogin} loading={isLoading} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4F1DE', // Your custom background color
    opacity: 0.8, // Adjust this value to control opacity (0.0 = transparent, 1.0 = opaque)
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 220,
    height: 220,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
