/**
 * Message Item Component
 * Displays a single message bubble
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { Message } from '../../types/chat';
import { formatMessageTime } from '../../utils/chat_utils';
import { MessageSendStatus } from './message_send_status';

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
        {message.status === 'failed' && isOwnMessage && (
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: theme.error }]}>Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.metaRow,
          isOwnMessage ? styles.metaRight : styles.metaLeft,
        ]}
      >
        {isOwnMessage && (
          <MessageSendStatus
            status={message.status || message.deliveryStatus}
            isOwnMessage={isOwnMessage}
          />
        )}
        
        <Text style={[styles.timestampOutside, { color: theme.textSecondary }]}>
          {formatMessageTime(message.createdAt)}
        </Text>
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
    borderBottomRightRadius: borderRadius.sm,
  },
  otherBubble: {
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
  },
  content: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: spacing.xs,
  },
  
  metaRight: {
    justifyContent: 'flex-end',
  },
  
  metaLeft: {
    justifyContent: 'flex-start',
  },
  
  timestampOutside: {
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

