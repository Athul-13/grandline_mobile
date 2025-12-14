/**
 * Chat Detail Screen
 * Displays a chat conversation with messages
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { ChatHeader } from '../../components/chat/chat_header';
import { MessageInput } from '../../components/chat/message_input';
import { MessageList } from '../../components/chat/message_list';
import { useChat } from '../../contexts/chat_context';
import { useSocketConnection } from '../../hooks/socket/use_socket_connection';
import { useTheme } from '../../hooks/use-theme';
import type { RootState } from '../../store/store';

export const ChatDetailScreen: React.FC = () => {
  const params = useLocalSearchParams<{ chatId: string }>();
  const chatId = params.chatId || '';
  const { driver } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { isConnected } = useSocketConnection();
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
    retryFailedMessage,
  } = useChat();

  const [isSending, setIsSending] = useState(false);
  const currentUserId = driver?.driverId || '';

  const chat = chats.find((c) => c.chatId === chatId);
  const chatMessages = messages[chatId] || [];
  const chatTypingUsers = typingUsers[chatId] || [];
  
  // Get chat title and subtitle
  const getChatTitle = () => {
    return 'Chat with Admin';
  };
  
  const getChatSubtitle = () => {
    if (chat) {
      return `${chat.contextType}: ${chat.contextId}`;
    }
    return '';
  };

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
  
  const handleRetry = async (messageId: string) => {
    try {
      await retryFailedMessage(chatId, messageId);
    } catch (err) {
      console.error('[ChatDetailScreen] Error retrying message:', err);
    }
  };

  if (isLoading && chatMessages.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom Header */}
      <ChatHeader
        title={getChatTitle()}
        subtitle={getChatSubtitle()}
        onBack={() => router.back()}
        showConnectionStatus
        isConnected={isConnected}
      />
      
      {/* Message List */}
      <MessageList
        messages={chatMessages}
        currentUserId={currentUserId}
        onRefresh={handleRefresh}
        refreshing={isLoading}
        typingUsers={chatTypingUsers}
        isLoading={isLoading}
        onRetry={handleRetry}
      />
      
      {/* Message Input with Keyboard Handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <MessageInput 
          chatId={chatId} 
          onSend={handleSend} 
          disabled={isSending}
          bottomInset={insets.bottom}
        />
      </KeyboardAvoidingView>
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

