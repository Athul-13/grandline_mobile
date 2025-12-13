import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { spacing, typography } from '../../constants/theme';
import { useForgotPassword } from '../../hooks/auth';
import { useTheme } from '../../hooks/use-theme';

export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const forgotPasswordMutation = useForgotPassword();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync(email);
      Alert.alert(
        'Email Sent',
                "If an account with that email exists, a password reset link has been sent. Please check your email and click the link to reset your password.",
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      // Error is already handled by the hook, but we show a generic message
      Alert.alert(
        'Error',
        error?.message || 'Failed to send password reset email. Please try again.',
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
                Forgot Password?
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                      setEmailError(null);
                    }
                  }}
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Submit Button */}
              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                loading={forgotPasswordMutation.isPending}
                disabled={forgotPasswordMutation.isPending}
                style={styles.submitButton}
              />

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.back()}
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

