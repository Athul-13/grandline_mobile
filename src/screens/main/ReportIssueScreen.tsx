import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const ReportIssueScreen: React.FC = () => {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    email: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Simple validation
    if (!formData.subject.trim() || !formData.description.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // For now, just show a success message
    Alert.alert(
      'Issue Reported',
      'Thank you for reporting the issue. We will get back to you soon.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Report an Issue
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Info Banner */}
            <View style={[styles.infoBanner, { backgroundColor: isDark ? '#2A2520' : theme.primaryLight }]}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                We're here to help! Please describe your issue in detail.
              </Text>
            </View>

            <View style={styles.form}>
              {/* Subject Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Subject *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.card,
                    borderColor: focusedField === 'subject' ? theme.primary : theme.border,
                    borderWidth: focusedField === 'subject' ? 2 : 1,
                  }
                ]}>
                  <Ionicons 
                    name="text-outline" 
                    size={20} 
                    color={focusedField === 'subject' ? theme.primary : theme.icon} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Brief description of the issue"
                    placeholderTextColor={theme.textSecondary}
                    value={formData.subject}
                    onChangeText={(text) => handleInputChange('subject', text)}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Description Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Description *
                </Text>
                <View style={[
                  styles.textAreaContainer,
                  { 
                    backgroundColor: theme.card,
                    borderColor: focusedField === 'description' ? theme.primary : theme.border,
                    borderWidth: focusedField === 'description' ? 2 : 1,
                  }
                ]}>
                  <Ionicons 
                    name="document-text-outline" 
                    size={20} 
                    color={focusedField === 'description' ? theme.primary : theme.icon} 
                    style={styles.textAreaIcon}
                  />
                  <TextInput
                    style={[styles.textArea, { color: theme.text }]}
                    placeholder="Please provide detailed information about the issue..."
                    placeholderTextColor={theme.textSecondary}
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                  Please be as specific as possible
                </Text>
              </View>

              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Email *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.card,
                    borderColor: focusedField === 'email' ? theme.primary : theme.border,
                    borderWidth: focusedField === 'email' ? 2 : 1,
                  }
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedField === 'email' ? theme.primary : theme.icon} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="your.email@example.com"
                    placeholderTextColor={theme.textSecondary}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                  We'll use this to follow up with you
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={handleSubmit}
              >
                <Ionicons name="send" size={20} color="white" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: spacing.md + 4,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm + 4,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  form: {
    gap: spacing.lg,
  },
  fieldContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  inputIcon: {
    marginLeft: spacing.md,
    marginRight: spacing.sm + 4,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.sizes.md,
  },
  textAreaContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    ...shadows.sm,
    minHeight: 140,
  },
  textAreaIcon: {
    marginLeft: spacing.md,
    marginTop: spacing.md,
    marginRight: spacing.sm + 4,
  },
  textArea: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 140,
  },
  helperText: {
    fontSize: typography.sizes.xs + 1,
    opacity: 0.6,
    marginLeft: 4,
    marginTop: 4,
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitIcon: {
    marginRight: spacing.sm,
  },
  submitButtonText: {
    color: 'white',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});