/**
 * Chat List Screen
 * Displays a list of all chats
 */

import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { ChatList } from '../../components/chat/chat_list';
import { useChat } from '../../contexts/chat_context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import type { Chat } from '../../types/chat';
import { ParticipantType } from '../../types/chat';
import type { RootState } from '../../store/store';

export const ChatListScreen: React.FC = () => {
  const router = useRouter();
  const { chats, isLoading, error, refreshChats, unreadCounts } = useChat();
  const { driver } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  // Create admin chat entry (always at top, even if no chatId exists yet)
  const adminChat: Chat | null = useMemo(() => {
    if (!driver?.driverId) return null;

    // Check if admin chat already exists in the list
    const existingAdminChat = chats.find(
      (chat) => chat.contextType === 'driver' && chat.contextId === driver.driverId
    );

    if (existingAdminChat) {
      return existingAdminChat;
    }

    // Create a placeholder chat entry for admin (no chatId yet)
    return {
      chatId: `admin-placeholder-${driver.driverId}`, // Placeholder ID
      contextType: 'driver',
      contextId: driver.driverId,
      participantType: ParticipantType.ADMIN_DRIVER,
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [chats, driver?.driverId]);

  // Combine admin chat (if exists) with other chats
  const allChats = useMemo(() => {
    if (!adminChat) return chats;

    // Filter out any existing admin chat from the list to avoid duplicates
    const otherChats = chats.filter(
      (chat) => !(chat.contextType === 'driver' && chat.contextId === driver?.driverId)
    );

    // Admin chat always at top
    return [adminChat, ...otherChats];
  }, [chats, adminChat, driver?.driverId]);

  const handleChatPress = (chat: Chat) => {
    // Check if this is the admin placeholder chat (no real chatId)
    const isAdminPlaceholder = chat.chatId.startsWith('admin-placeholder-');

    if (isAdminPlaceholder) {
      // Navigate with contextType + contextId (will auto-create on first message)
      router.push({
        pathname: '/(main)/(settings)/chat-detail',
        params: {
          contextType: 'driver',
          contextId: chat.contextId,
        },
      });
    } else {
      // Regular chat with chatId
      router.push({
        pathname: '/(main)/(settings)/chat-detail',
        params: { chatId: chat.chatId },
      });
    }
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
        chats={allChats}
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

