/**
 * Chat List Screen
 * Displays a list of all chats
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatList } from '../../components/chat/chat_list';
import { useChat } from '../../contexts/chat_context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { Chat } from '../../types/chat';

export const ChatListScreen: React.FC = () => {
  const router = useRouter();
  const { chats, isLoading, error, refreshChats, unreadCounts } = useChat();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/(main)/(settings)/chat-detail',
      params: { chatId: chat.chatId },
    });
  };

  if (isLoading && chats.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error || '#ff0000' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Chats</Text>
        <View style={{ width: 40 }} />
      </View>
      <ChatList
        chats={chats}
        onChatPress={handleChatPress}
        onRefresh={refreshChats}
        refreshing={isLoading}
        unreadCounts={unreadCounts}
        bottomInset={insets.bottom + 100}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: spacing.md + 4,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

