/**
 * Chat List Component
 * Displays a list of chats
 */

import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { spacing } from '../../constants/theme';
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
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
    paddingTop: spacing.sm,
  },
});

