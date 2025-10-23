import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, changePassword, clearError } from '../../store';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export const PasswordChangeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  // Get auth state from Redux
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    newPasswordError: null as string | null,
    confirmPasswordError: null as string | null,
  });

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error alert when password change fails
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Password Change Failed',
        error,
        [{ text: 'OK', onPress: () => dispatch(clearError()) }]
      );
    }
  }, [error, dispatch]);

  const validatePassword = (password: string): string | null => {
    if (!password.trim()) {
      return 'Password is required';
    }
    if (password.trim().length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword.trim()) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleNewPasswordChange = (password: string) => {
    const error = validatePassword(password);
    setFormData(prev => ({
      ...prev,
      newPassword: password,
      newPasswordError: error,
    }));
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    const error = validateConfirmPassword(formData.newPassword, confirmPassword);
    setFormData(prev => ({
      ...prev,
      confirmPassword,
      confirmPasswordError: error,
    }));
  };

  const handleContinue = async () => {
    const newPasswordError = validatePassword(formData.newPassword);
    const confirmPasswordError = validateConfirmPassword(formData.newPassword, formData.confirmPassword);

    if (newPasswordError || confirmPasswordError) {
      setFormData(prev => ({
        ...prev,
        newPasswordError,
        confirmPasswordError,
      }));
      return;
    }

    try {
      // Dispatch password change action
      await dispatch(changePassword({
        currentPassword: '', // In real app, you'd get this from user input
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })).unwrap();
      
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully!',
        [{ 
          text: 'OK',
          onPress: () => router.push('/(auth)/onboarding')
        }]
      );
    } catch (error) {
      // Error is handled by useEffect above
      console.error('Password change error:', error);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skipped',
      'Password change skipped. You can change it later in settings.',
      [{ 
        text: 'OK',
        onPress: () => router.push('/(auth)/onboarding')
      }]
    );
  };

  const isFormValid = !formData.newPasswordError && !formData.confirmPasswordError && 
                     formData.newPassword.trim() && formData.confirmPassword.trim();

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
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                Wish to change password?
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <Input
                label="New Password"
                value={formData.newPassword}
                onChangeText={handleNewPasswordChange}
                placeholder="Enter new password"
                secureTextEntry
                error={formData.newPasswordError}
              />
              
              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="Confirm new password"
                secureTextEntry
                error={formData.confirmPasswordError}
              />
              
              <View style={styles.buttonContainer}>
                <Button
                  title="Continue"
                  onPress={handleContinue}
                  disabled={!isFormValid}
                  loading={isLoading}
                  style={styles.continueButton}
                />
                
                <Button
                  title="Skip"
                  onPress={handleSkip}
                  variant="secondary"
                  style={styles.skipButton}
                />
              </View>
            </View>
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
    backgroundColor: '#F4F1DE',
    opacity: 0.8,
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
    width: 130,
    height: 130,
    marginBottom: 20,
    transform: [{ translateX: -5 }],
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#C5630C',
  },
  skipButton: {
    backgroundColor: '#F4F1DE',
    borderColor: '#C5630C',
    borderWidth: 1,
  },
});
