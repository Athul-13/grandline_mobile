/**
 * Message Item Component
 * Displays a single message bubble
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { borderRadius, spacing, typography, shadows } from '../../constants/theme';
import { formatMessageTime } from '../../utils/chat_utils';
import { MessageSendStatus } from './message_send_status';
import type { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message & { status?: 'sending' | 'failed' };
  isOwnMessage: boolean;
  onRetry?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, onRetry }) => {
  const { theme } = useTheme();
  
  const handleRetry = () => {
    if (onRetry && message.status === 'failed') {
      onRetry(message.messageId);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage 
            ? [styles.ownBubble, { backgroundColor: theme.primary }] 
            : [styles.otherBubble, { backgroundColor: theme.card, borderColor: theme.border }],
          message.status === 'failed' && { borderColor: theme.error, borderWidth: 1 },
        ]}
      >
        <Text
          style={[
            styles.content,
            isOwnMessage 
              ? { color: 'white' } 
              : { color: theme.text },
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.timestamp, { color: isOwnMessage ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
            {formatMessageTime(message.createdAt)}
          </Text>
          <MessageSendStatus 
            status={message.status || message.deliveryStatus}
            isOwnMessage={isOwnMessage}
          />
        </View>
        
        {message.status === 'failed' && isOwnMessage && (
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: theme.error }]}>Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  ownBubble: {
    borderBottomRightRadius: borderRadius.xs,
  },
  otherBubble: {
    borderBottomLeftRadius: borderRadius.xs,
    borderWidth: 1,
  },
  content: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    marginRight: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  retryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});

