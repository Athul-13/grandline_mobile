import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { LoginForm } from '../../components/auth/login_form';
import { Colors } from '../../constants/theme';
import { useLogin } from '../../hooks/auth';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError } from '../../store/slices/auth_slice';
import type { LoginCredentials } from '../../types/auth';

export const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const loginMutation = useLogin();
  
  // Get auth state from Redux
  const { error, isAuthenticated, driver } = useAppSelector((state) => state.auth);
  const isLoginLoading = loginMutation.isPending;

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate based on onboarding status when login is successful
  useEffect(() => {
    if (isAuthenticated && driver) {
      if (driver.isOnboarded) {
        // Driver has completed onboarding, go to main app
        router.replace('/(main)/(dashboard)');
      } else {
        // Driver hasn't completed onboarding, go to password change first
        router.replace('/(auth)/password-change');
      }
    }
  }, [isAuthenticated, driver, router]);

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
      await loginMutation.mutateAsync(credentials);
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
            
            <LoginForm onSubmit={handleLogin} loading={isLoginLoading} />
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
