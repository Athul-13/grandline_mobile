/**
 * Chat List Component
 * Displays a list of chats
 */

import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { ChatItem } from './chat_item';
import type { Chat } from '../../types/chat';

interface ChatListProps {
  chats: Chat[];
  onChatPress: (chat: Chat) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  unreadCounts?: Record<string, number>;
  bottomInset?: number;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatPress,
  onRefresh,
  refreshing = false,
  unreadCounts = {},
  bottomInset = 8,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.chatId}
        renderItem={({ item }) => (
          <ChatItem
            chat={item}
            onPress={() => onChatPress(item)}
            unreadCount={unreadCounts[item.chatId] || 0}
          />
        )}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset }
        ]}
      />
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
});

