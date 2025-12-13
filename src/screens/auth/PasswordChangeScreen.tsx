import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { useChangePassword, useUpdateOnboardingPassword } from '../../hooks/auth';
import { useTheme } from '../../hooks/use-theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError } from '../../store/slices/auth_slice';

interface PasswordChangeScreenProps {
  isOnboardingFlow?: boolean;
}

export const PasswordChangeScreen: React.FC<PasswordChangeScreenProps> = ({ 
  isOnboardingFlow = false 
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  
  // Get auth state from Redux
  const { error } = useAppSelector((state) => state.auth);
  const changePasswordMutation = useChangePassword();
  const updateOnboardingPasswordMutation = useUpdateOnboardingPassword();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    currentPasswordError: null as string | null,
    newPasswordError: null as string | null,
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
    if (password.trim().length < 8) {
      return 'Password must be at least 8 characters';
    }
    // Check for at least one lowercase, one uppercase, and one number
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }
    return null;
  };

  const validateCurrentPassword = (password: string): string | null => {
    if (!password.trim()) {
      return 'Current password is required';
    }
    return null;
  };

  const handleCurrentPasswordChange = (password: string) => {
    const error = validateCurrentPassword(password);
    setFormData(prev => ({
      ...prev,
      currentPassword: password,
      currentPasswordError: error,
    }));
  };

  const handleNewPasswordChange = (password: string) => {
    const error = validatePassword(password);
    setFormData(prev => ({
      ...prev,
      newPassword: password,
      newPasswordError: error,
    }));
  };

  const handleContinue = async () => {
    // For authenticated password change, validate current password
    if (!isOnboardingFlow) {
      const currentPasswordError = validateCurrentPassword(formData.currentPassword);
      if (currentPasswordError) {
        setFormData(prev => ({
          ...prev,
          currentPasswordError,
        }));
        return;
      }
    }

    const newPasswordError = validatePassword(formData.newPassword);

    if (newPasswordError) {
      setFormData(prev => ({
        ...prev,
        newPasswordError,
      }));
      return;
    }

    try {
      // Use correct endpoint based on flow
      if (isOnboardingFlow) {
        // Use onboarding password endpoint (no current password required)
        await updateOnboardingPasswordMutation.mutateAsync({
          newPassword: formData.newPassword,
        });
      } else {
        // Use regular change password endpoint (requires current password)
        await changePasswordMutation.mutateAsync({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }
      
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully!',
        [{ 
          text: 'OK',
          onPress: () => {
            if (isOnboardingFlow) {
              router.replace('/(auth)/onboarding');
            } else {
              router.back();
            }
          }
        }]
      );
    } catch (error: any) {
      // Show error alert
      Alert.alert(
        'Password Change Failed',
        error?.message || 'Failed to change password. Please check your current password and try again.',
        [{ text: 'OK' }]
      );
      console.error('Password change error:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skipped',
      'Password change skipped. You can change it later in settings.',
      [{ 
        text: 'OK',
        onPress: () => router.replace('/(auth)/onboarding')
      }]
    );
  };

  const isFormValid = 
    (isOnboardingFlow || (!formData.currentPasswordError && formData.currentPassword.trim())) &&
    !formData.newPasswordError && 
    formData.newPassword.trim();

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
              {/* Conditional Back button for profile context */}
              {!isOnboardingFlow && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color={theme.primary} />
                </TouchableOpacity>
              )}
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: theme.text }]}>
                {isOnboardingFlow ? 'Wish to change password?' : 'Change Password'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Create a strong password to secure your account
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              {/* Current Password - only shown when changing from settings (not onboarding) */}
              {!isOnboardingFlow && (
                <Input
                  label="Current Password"
                  value={formData.currentPassword}
                  onChangeText={handleCurrentPasswordChange}
                  placeholder="Enter current password"
                  secureTextEntry
                  error={formData.currentPasswordError}
                />
              )}
              
              <Input
                label="New Password"
                value={formData.newPassword}
                onChangeText={handleNewPasswordChange}
                placeholder="Enter new password"
                secureTextEntry
                error={formData.newPasswordError}
              />
              
              {/* Password requirements */}
              <View style={[styles.requirementsBox, { backgroundColor: theme.card }]}>
                <View style={styles.requirementRow}>
                  <Ionicons 
                    name={formData.newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={formData.newPassword.length >= 8 ? theme.success : theme.textSecondary} 
                  />
                  <Text style={[styles.requirementText, { color: theme.text }]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons 
                    name={/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword) ? theme.success : theme.textSecondary} 
                  />
                  <Text style={[styles.requirementText, { color: theme.text }]}>
                    Contains uppercase, lowercase, and number
                  </Text>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="Change Password"
                  onPress={handleContinue}
                  disabled={!isFormValid}
                  loading={isOnboardingFlow ? updateOnboardingPasswordMutation.isPending : changePasswordMutation.isPending}
                  style={[styles.continueButton, { backgroundColor: theme.primary }]}
                />
                
                {/* Conditional Skip button for onboarding flow */}
                {isOnboardingFlow && (
                  <Button
                    title="Skip for Now"
                    onPress={handleSkip}
                    variant="secondary"
                    style={[styles.skipButton, { borderColor: theme.primary }]}
                  />
                )}
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
    paddingBottom: 120, // Space for floating navbar
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
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderRadius: borderRadius.md,
  },
});