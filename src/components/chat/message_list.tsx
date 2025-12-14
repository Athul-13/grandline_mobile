/**
 * Message List Component
 * Displays a list of messages in a chat
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { spacing, typography } from '../../constants/theme';
import { MessageItem } from './message_item';
import { TypingIndicator } from './typing_indicator';
import { EmptyChatState } from './empty_chat_state';
import type { Message } from '../../types/chat';

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
        data={messages}
        keyExtractor={(item) => item.messageId}
        renderItem={({ item }) => (
          <MessageItem 
            message={item} 
            isOwnMessage={item.senderId === currentUserId} 
            onRetry={onRetry}
          />
        )}
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
});

