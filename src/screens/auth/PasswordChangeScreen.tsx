import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, changePassword, clearError } from '../../store';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const PasswordChangeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  
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

  const handleBack = () => {
    router.back();
  };

  const isFormValid = !formData.newPasswordError && !formData.confirmPasswordError && 
                     formData.newPassword.trim() && formData.confirmPassword.trim();

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Dynamic overlay that changes with theme */}
      <View style={[styles.overlay, { backgroundColor: theme.background }]} />
      
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
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color={theme.primary} />
              </TouchableOpacity>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: theme.text }]}>
                Change Password
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Create a strong password to secure your account
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
              
              {/* Password requirements */}
              <View style={[styles.requirementsBox, { backgroundColor: theme.card }]}>
                <View style={styles.requirementRow}>
                  <Ionicons 
                    name={formData.newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={formData.newPassword.length >= 6 ? theme.success : theme.textSecondary} 
                  />
                  <Text style={[styles.requirementText, { color: theme.text }]}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons 
                    name={formData.newPassword === formData.confirmPassword && formData.confirmPassword ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={formData.newPassword === formData.confirmPassword && formData.confirmPassword ? theme.success : theme.textSecondary} 
                  />
                  <Text style={[styles.requirementText, { color: theme.text }]}>
                    Passwords match
                  </Text>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="Change Password"
                  onPress={handleContinue}
                  disabled={!isFormValid}
                  loading={isLoading}
                  style={[styles.continueButton, { backgroundColor: theme.primary }]}
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
    opacity: 0.92, // Slightly transparent to show subtle background texture
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md + 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl + 8,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: spacing.md + 4,
    transform: [{ translateX: -5 }],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  requirementsBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  requirementText: {
    fontSize: typography.sizes.sm,
  },
  buttonContainer: {
    marginTop: spacing.md + 4,
    gap: spacing.sm + 4,
  },
  continueButton: {
    borderRadius: borderRadius.md,
  },
});