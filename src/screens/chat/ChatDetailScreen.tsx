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
import { useSocket } from '../../hooks/socket/use_socket';
import { useTheme } from '../../hooks/use-theme';
import { chatService } from '../../services/api/chat_service';
import { chatSocketService } from '../../services/socket/chat_socket_service';
import type { RootState } from '../../store/store';

export const ChatDetailScreen: React.FC = () => {
  const params = useLocalSearchParams<{ chatId?: string; contextType?: string; contextId?: string }>();
  const chatId = params.chatId || '';
  const contextType = params.contextType;
  const contextId = params.contextId;
  const { driver } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { isConnected } = useSocket();
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
    refreshChats,
  } = useChat();

  const [isSending, setIsSending] = useState(false);
  const [resolvedChatId, setResolvedChatId] = useState<string>('');
  const [isResolvingChat, setIsResolvingChat] = useState(false);
  const currentUserId = driver?.driverId || '';

  // Resolve chat by context if contextType + contextId provided
  useEffect(() => {
    if (chatId) {
      setResolvedChatId(chatId);
      return;
    }

    if (!contextType || !contextId) {
      return;
    }

    const resolveChat = async () => {
      setIsResolvingChat(true);
      try {
        const { chat } = await chatService.getChatByContext({ contextType, contextId });
        if (chat) {
          setResolvedChatId(chat.chatId);
          // Refresh chats to include this one
          await refreshChats();
        } else {
          // Chat doesn't exist yet - will be auto-created on first message
          // Use empty string, messages will be sent with contextType + contextId
          setResolvedChatId('');
        }
      } catch (err) {
        console.error('[ChatDetailScreen] Error resolving chat by context:', err);
      } finally {
        setIsResolvingChat(false);
      }
    };

    resolveChat();
  }, [chatId, contextType, contextId, refreshChats]);

  const chat = resolvedChatId ? chats.find((c) => c.chatId === resolvedChatId) : null;
  const chatMessages = resolvedChatId ? messages[resolvedChatId] || [] : [];
  const chatTypingUsers = resolvedChatId ? typingUsers[resolvedChatId] || [] : [];
  
  // Get chat title and subtitle
  const getChatTitle = () => {
    if (contextType === 'reservation') {
      return 'Chat with Rider';
    }
    return 'Chat with Admin';
  };
  
  const getChatSubtitle = () => {
    if (chat) {
      return `${chat.contextType}: ${chat.contextId}`;
    }
    if (contextType && contextId) {
      return `${contextType}: ${contextId}`;
    }
    return '';
  };

  useEffect(() => {
    if (!resolvedChatId) {
      return;
    }

    // Set active chat when screen mounts
    setActiveChat(resolvedChatId);

    // Load messages
    loadMessages(resolvedChatId).catch(console.error);

    // Mark as read when opening chat
    markAsRead(resolvedChatId).catch(console.error);

    // Cleanup: leave chat when screen unmounts
    return () => {
      setActiveChat(null);
    };
  }, [resolvedChatId, setActiveChat, loadMessages, markAsRead]);

  const handleSend = async (content: string) => {
    setIsSending(true);
    try {
      if (resolvedChatId) {
        // Use existing chat
        await sendMessage(resolvedChatId, content);
      } else if (contextType && contextId) {
        // Send with contextType + contextId (backend will auto-create chat)
        await new Promise<void>((resolve, reject) => {
          const cleanup = chatSocketService.sendMessage(
            { contextType, contextId, content: content.trim() },
            async (message) => {
              cleanup?.();
              // Chat was created, refresh chats and resolve chatId
              await refreshChats();
              const { chat: newChat } = await chatService.getChatByContext({ contextType, contextId });
              if (newChat) {
                setResolvedChatId(newChat.chatId);
                // Load messages for the new chat
                await loadMessages(newChat.chatId).catch(console.error);
              }
              resolve();
            },
            (error) => {
              cleanup?.();
              console.error('[ChatDetailScreen] Error sending message:', error);
              reject(new Error(error.message || 'Failed to send message'));
            }
          );
        });
      } else {
        throw new Error('Cannot send message: no chatId or context provided');
      }
    } catch (err) {
      console.error('[ChatDetailScreen] Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    if (!resolvedChatId) return;
    try {
      await loadMessages(resolvedChatId);
    } catch (err) {
      console.error('[ChatDetailScreen] Error refreshing messages:', err);
    }
  };
  
  const handleRetry = async (messageId: string) => {
    if (!resolvedChatId) return;
    try {
      await retryFailedMessage(resolvedChatId, messageId);
    } catch (err) {
      console.error('[ChatDetailScreen] Error retrying message:', err);
    }
  };

  if (isResolvingChat || (isLoading && chatMessages.length === 0 && resolvedChatId)) {
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
          chatId={resolvedChatId || 'temp'} 
          onSend={handleSend} 
          disabled={isSending || isResolvingChat}
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

