/**
 * Empty Chat State Component
 * Shows illustration and message when there are no messages in the chat
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export const EmptyChatState: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
        <Ionicons 
          name="chatbubbles-outline" 
          size={64} 
          color={theme.primary} 
        />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>
        No messages yet
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Start the conversation by sending a message
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

