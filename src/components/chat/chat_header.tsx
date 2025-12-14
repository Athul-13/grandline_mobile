/**
 * Chat Header Component
 * Custom header for chat screens with back button, title, subtitle, and connection status
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  showConnectionStatus?: boolean;
  isConnected?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showConnectionStatus = false,
  isConnected = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top + spacing.sm,
        backgroundColor: theme.background,
        borderBottomColor: theme.border,
      }
    ]}>
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        <View style={styles.rightSpace} />
      </View>
      
      {showConnectionStatus && !isConnected && (
        <View style={[styles.statusBar, { backgroundColor: theme.warning }]}>
          <Text style={styles.statusText}>Connecting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  rightSpace: {
    width: 40, // Balance the back button
  },
  statusBar: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});

