import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { spacing, typography } from '../../constants/theme';
import { useResetPassword } from '../../hooks/auth';
import { useTheme } from '../../hooks/use-theme';

export const ResetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ token?: string }>();
  const resetPasswordMutation = useResetPassword();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    newPasswordError: null as string | null,
    confirmPasswordError: null as string | null,
  });

  const token = params.token;

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'The password reset link is invalid or has expired. Please request a new one.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    }
  }, [token, router]);

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setFormData((prev) => ({ ...prev, newPasswordError: 'Password is required' }));
      return false;
    }
    if (password.length < 8) {
      setFormData((prev) => ({ ...prev, newPasswordError: 'Password must be at least 8 characters' }));
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setFormData((prev) => ({
        ...prev,
        newPasswordError: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      }));
      return false;
    }
    setFormData((prev) => ({ ...prev, newPasswordError: null }));
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword.trim()) {
      setFormData((prev) => ({ ...prev, confirmPasswordError: 'Please confirm your password' }));
      return false;
    }
    if (confirmPassword !== formData.newPassword) {
      setFormData((prev) => ({ ...prev, confirmPasswordError: 'Passwords do not match' }));
      return false;
    }
    setFormData((prev) => ({ ...prev, confirmPasswordError: null }));
    return true;
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset token. Please request a new password reset link.');
      return;
    }

    const isPasswordValid = validatePassword(formData.newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(formData.confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: formData.newPassword,
      });
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to reset password. The link may have expired. Please request a new one.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('../../assets/images/login-bg.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>

              {/* Logo */}
              <Image
                source={require('../../assets/images/mainpage-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              {/* Title */}
              <Text style={[styles.title, { color: theme.text }]}>
                Reset Password
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Enter your new password below.
              </Text>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, newPassword: text, newPasswordError: null }));
                  }}
                  error={formData.newPasswordError}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Input
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: text, confirmPasswordError: null }));
                  }}
                  error={formData.confirmPasswordError}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Submit Button */}
              <Button
                title="Reset Password"
                onPress={handleSubmit}
                loading={resetPasswordMutation.isPending}
                disabled={resetPasswordMutation.isPending || !token}
                style={styles.submitButton}
              />

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={[styles.backToLoginText, { color: theme.primary }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1,
    padding: spacing.sm,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  backToLogin: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});

