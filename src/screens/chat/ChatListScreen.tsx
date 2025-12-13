/**
 * Chat List Screen
 * Displays a list of all chats
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { ChatList } from '../../components/chat/chat_list';
import { useChat } from '../../contexts/chat_context';
import { useRouter } from 'expo-router';
import type { Chat } from '../../types/chat';

export const ChatListScreen: React.FC = () => {
  const router = useRouter();
  const { chats, isLoading, error, refreshChats, unreadCounts } = useChat();

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/(main)/chat/chat-detail',
      params: { chatId: chat.chatId },
    });
  };

  if (isLoading && chats.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatList
        chats={chats}
        onChatPress={handleChatPress}
        onRefresh={refreshChats}
        refreshing={isLoading}
        unreadCounts={unreadCounts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
  },
});

