/**
 * Message List Component
 * Displays a list of messages in a chat
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { MessageItem } from './message_item';
import { TypingIndicator } from './typing_indicator';
import { EmptyChatState } from './empty_chat_state';
import { getDateLabel, isDifferentDay } from '../../utils/chat_utils';
import type { Message } from '../../types/chat';

interface MessageWithSeparator {
  type: 'message' | 'dateSeparator';
  message?: Message;
  dateLabel?: string;
  key: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  typingUsers?: string[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onRefresh,
  refreshing = false,
  typingUsers = [],
  isLoading = false,
  onRetry,
}) => {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  // Prepare messages with date separators
  const messagesWithSeparators = useMemo<MessageWithSeparator[]>(() => {
    if (messages.length === 0) return [];

    const result: MessageWithSeparator[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageDate = new Date(message.createdAt);
      
      // Add date separator if this is the first message or date changed
      if (i === 0 || isDifferentDay(messageDate, new Date(messages[i - 1].createdAt))) {
        result.push({
          type: 'dateSeparator',
          dateLabel: getDateLabel(messageDate),
          key: `date-${messageDate.toISOString().split('T')[0]}`,
        });
      }
      
      // Add the message
      result.push({
        type: 'message',
        message,
        key: message.messageId,
      });
    }
    
    return result;
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  if (isLoading && messages.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading messages...</Text>
      </View>
    );
  }
  
  if (messages.length === 0 && !isLoading) {
    return <EmptyChatState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={messagesWithSeparators}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.type === 'dateSeparator') {
            return (
              <View style={styles.dateSeparatorContainer}>
                <View style={[styles.dateSeparator, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.dateSeparatorText, { color: theme.textSecondary }]}>
                    {item.dateLabel}
                  </Text>
                </View>
              </View>
            );
          }
          
          if (item.message) {
            return (
              <MessageItem 
                message={item.message} 
                isOwnMessage={item.message.senderId === currentUserId} 
                onRetry={onRetry}
              />
            );
          }
          
          return null;
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyContent,
        ]}
        inverted={false}
      />
      {typingUsers.length > 0 && <TypingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dateSeparator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  dateSeparatorText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});

