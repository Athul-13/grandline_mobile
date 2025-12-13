/**
 * Message List Component
 * Displays a list of messages in a chat
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { MessageItem } from './message_item';
import type { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  typingUsers?: string[];
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onRefresh,
  refreshing = false,
  typingUsers = [],
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.messageId}
        renderItem={({ item }) => (
          <MessageItem message={item} isOwnMessage={item.senderId === currentUserId} />
        )}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        inverted={false}
      />
      {typingUsers.length > 0 && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

