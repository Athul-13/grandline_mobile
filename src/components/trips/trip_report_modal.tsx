/**
 * Trip Report Modal
 * Allows driver to optionally submit a report after ending a trip
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface TripReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (reportContent: string) => Promise<void>;
  isLoading?: boolean;
}

const MAX_REPORT_LENGTH = 2000;

export const TripReportModal: React.FC<TripReportModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [reportContent, setReportContent] = useState('');

  const handleSubmit = async () => {
    const trimmedContent = reportContent.trim();
    
    if (trimmedContent.length === 0) {
      Alert.alert('Validation Error', 'Please enter a report or skip to continue.');
      return;
    }

    if (trimmedContent.length > MAX_REPORT_LENGTH) {
      Alert.alert(
        'Validation Error',
        `Report cannot exceed ${MAX_REPORT_LENGTH} characters. Current: ${trimmedContent.length}`
      );
      return;
    }

    try {
      await onSubmit(trimmedContent);
      setReportContent('');
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Failed to submit report:', error);
    }
  };

  const handleSkip = () => {
    setReportContent('');
    onClose();
  };

  const remainingChars = MAX_REPORT_LENGTH - reportContent.length;
  const canSubmit = reportContent.trim().length > 0 && !isLoading;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.card },
            shadows.lg,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}1A` }]}>
                <Ionicons name="document-text-outline" size={24} color={theme.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.text }]}>Trip Report</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Optional - Share any notes about this trip
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.divider,
                },
              ]}
              placeholder="Enter your trip report (e.g., issues encountered, passenger feedback, vehicle condition, etc.)"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={reportContent}
              onChangeText={setReportContent}
              maxLength={MAX_REPORT_LENGTH}
              editable={!isLoading}
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {remainingChars} characters remaining
            </Text>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.md }]}>
            <TouchableOpacity
              style={[
                styles.skipButton,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.divider,
                },
              ]}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: canSubmit ? theme.primary : theme.divider,
                },
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  content: {
    padding: spacing.lg,
  },
  textInput: {
    minHeight: 150,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
});

