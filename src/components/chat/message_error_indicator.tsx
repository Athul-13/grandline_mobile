/**
 * Message Error Indicator Component
 * Shows inline error message with retry and dismiss buttons
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface MessageErrorIndicatorProps {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export const MessageErrorIndicator: React.FC<MessageErrorIndicatorProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.error + '10', 
        borderColor: theme.error 
      }
    ]}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onRetry} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: theme.primary }]}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});

