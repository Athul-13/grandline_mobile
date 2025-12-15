/**
 * Chat Item Component
 * Displays a single chat item in the chat list
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import type { Chat } from '../../types/chat';

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
  unreadCount?: number;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, onPress, unreadCount = 0 }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.contextType, { color: theme.text }]} numberOfLines={1}>
            {chat.contextType} - {chat.contextId}
          </Text>
          <Text style={[styles.participantType, { color: theme.textSecondary }]} numberOfLines={1}>
            {chat.participantType}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  contextType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  participantType: {
    fontSize: typography.sizes.sm,
  },
  badge: {
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});

