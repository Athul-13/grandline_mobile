/**
 * Chat Detail Screen
 * Displays a chat conversation with messages
 */

import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { MessageInput } from '../../components/chat/message_input';
import { MessageList } from '../../components/chat/message_list';
import { useChat } from '../../contexts/chat_context';
import type { RootState } from '../../store/store';

export const ChatDetailScreen: React.FC = () => {
  const params = useLocalSearchParams<{ chatId: string }>();
  const chatId = params.chatId || '';
  const { driver } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();
  const {
    chats,
    messages,
    typingUsers,
    isLoading,
    error,
    loadMessages,
    sendMessage,
    markAsRead,
    setActiveChat,
  } = useChat();

  const [isSending, setIsSending] = useState(false);
  const currentUserId = driver?.driverId || '';

  const chat = chats.find((c) => c.chatId === chatId);
  const chatMessages = messages[chatId] || [];
  const chatTypingUsers = typingUsers[chatId] || [];

  useEffect(() => {
    if (!chatId) {
      return;
    }

    // Set active chat when screen mounts
    setActiveChat(chatId);

    // Load messages
    loadMessages(chatId).catch(console.error);

    // Mark as read when opening chat
    markAsRead(chatId).catch(console.error);

    // Cleanup: leave chat when screen unmounts
    return () => {
      setActiveChat(null);
    };
  }, [chatId, setActiveChat, loadMessages, markAsRead]);

  const handleSend = async (content: string) => {
    setIsSending(true);
    try {
      await sendMessage(chatId, content);
    } catch (err) {
      console.error('[ChatDetailScreen] Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadMessages(chatId);
    } catch (err) {
      console.error('[ChatDetailScreen] Error refreshing messages:', err);
    }
  };

  if (isLoading && chatMessages.length === 0) {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 + insets.top : 0}
    >
      <MessageList
        messages={chatMessages}
        currentUserId={currentUserId}
        onRefresh={handleRefresh}
        refreshing={isLoading}
        typingUsers={chatTypingUsers}
      />
      <MessageInput 
        chatId={chatId} 
        onSend={handleSend} 
        disabled={isSending}
        bottomInset={insets.bottom}
      />
    </KeyboardAvoidingView>
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

