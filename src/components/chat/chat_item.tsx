/**
 * Chat Item Component
 * Displays a single chat item in the chat list
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { Chat } from '../../types/chat';
import { ParticipantType } from '../../types/chat';

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
  unreadCount?: number;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  onPress,
  unreadCount = 0,
}) => {
  const { theme } = useTheme();

  const isAdminChat = chat.participantType === ParticipantType.ADMIN_DRIVER;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          {isAdminChat ? (
            // 🔹 ADMIN CHAT (minimal & clear)
            <View style={styles.adminRow}>
              <View style={[styles.adminBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
              <Text
                style={[styles.title, { color: theme.text }]}
                numberOfLines={1}
              >
                Admin Support
              </Text>
            </View>
          ) : (
            // 🔹 NORMAL CHAT
            <>
              <Text
                style={[styles.title, { color: theme.text }]}
                numberOfLines={1}
              >
                {chat.contextType}
              </Text>

              <Text
                style={[styles.subtitle, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {chat.participantType}
              </Text>
            </>
          )}
        </View>

        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
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

  // Admin
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  // Text
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
  },

  // Unread badge
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

