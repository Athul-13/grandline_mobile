import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNetworkStatus } from '../hooks/network/use_network_status';
import { useSocketConnection } from '../hooks/socket/use_socket_connection';
import { chatService } from '../services/api/chat_service';
import { offlineQueueService } from '../services/queue/offline_queue';
import { chatSocketService } from '../services/socket/chat_socket_service';
import { chatStorage } from '../services/storage/chat_storage';
import type { RootState } from '../store/store';
import type { Chat, Message } from '../types/chat';
import { MessageDeliveryStatus } from '../types/chat';
import { QueueItemType } from '../types/queue';

/**
 * Chat context state
 */
interface ChatContextState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  typingUsers: Record<string, string[]>; // chatId -> userIds who are typing
  unreadCounts: Record<string, number>; // chatId -> unread count
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  setActiveChat: (chatId: string | null) => void;
  refreshChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  joinChat: (chatId: string) => Promise<void>;
  leaveChat: (chatId: string) => Promise<void>;
}

/**
 * Chat Context
 */
const ChatContext = createContext<ChatContextState | undefined>(undefined);

/**
 * Chat Provider Props
 */
interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * Chat Provider
 * Manages chat state, socket integration, and local storage
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { driver } = useSelector((state: RootState) => state.auth);
  const { isConnected } = useSocketConnection();
  const { isConnected: isNetworkConnected } = useNetworkStatus();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketListenersRef = useRef<(() => void)[]>([]);

  const currentUserId = driver?.driverId || '';
  const canSendMessages = isConnected && isNetworkConnected;

  /**
   * Refresh chats from server
   */
  const refreshChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.getChats();
      setChats(response.chats);

      // Save to storage
      await chatStorage.saveChats(response.chats);
      await chatStorage.saveLastSync(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chats';
      setError(errorMessage);
      console.error('[ChatContext] Error refreshing chats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load chats and messages from storage on mount
   */
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const storedChats = await chatStorage.getChats();
        setChats(storedChats);

        // Load messages for each chat
        const messagesMap: Record<string, Message[]> = {};
        for (const chat of storedChats) {
          const chatMessages = await chatStorage.getMessages(chat.chatId);
          messagesMap[chat.chatId] = chatMessages;
        }
        setMessages(messagesMap);
      } catch (err) {
        console.error('[ChatContext] Error loading from storage:', err);
      }
    };

    loadFromStorage();
  }, []);

  /**
   * Set up socket listeners when connected and sync on startup
   */
  useEffect(() => {
    if (!isConnected || !currentUserId) {
      return;
    }

    // Sync with server on socket connection (startup or reconnection)
    const syncOnConnection = async () => {
      try {
        // Refresh chats from server
        await refreshChats();
        console.log('[ChatContext] Synced chats on socket connection');

        // Sync offline queue if network is connected
        if (isNetworkConnected) {
          const syncResult = await offlineQueueService.syncQueue();
          if (syncResult.success > 0) {
            console.log(`[ChatContext] Synced ${syncResult.success} queued items`);
          }
          if (syncResult.failed > 0) {
            console.warn(`[ChatContext] Failed to sync ${syncResult.failed} queued items`);
          }
        }
      } catch (err) {
        console.error('[ChatContext] Error syncing chats:', err);
      }
    };

    syncOnConnection();

    // Listen for new messages
    const cleanupMessageSent = chatSocketService.onMessageSent((message) => {
      console.log('[ChatContext] New message received:', message);
      setMessages((prev) => {
        const chatMessages = prev[message.chatId] || [];
        // Check if message already exists
        if (chatMessages.some((m) => m.messageId === message.messageId)) {
          return prev;
        }
        return {
          ...prev,
          [message.chatId]: [...chatMessages, message],
        };
      });

      // Save to storage
      chatStorage.saveMessage(message.chatId, message).catch(console.error);

      // Update chat's updatedAt
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === message.chatId
            ? { ...chat, updatedAt: message.createdAt }
            : chat
        )
      );
    });

    if (cleanupMessageSent) {
      socketListenersRef.current.push(cleanupMessageSent);
    }

    // Listen for message delivered
    const cleanupMessageDelivered = chatSocketService.onMessageDelivered((data) => {
      console.log('[ChatContext] Message delivered:', data);
      setMessages((prev) => {
        const chatMessages = prev[data.chatId] || [];
        return {
          ...prev,
          [data.chatId]: chatMessages.map((msg) =>
            msg.messageId === data.messageId
              ? { ...msg, deliveryStatus: MessageDeliveryStatus.DELIVERED }
              : msg
          ),
        };
      });
    });

    if (cleanupMessageDelivered) {
      socketListenersRef.current.push(cleanupMessageDelivered);
    }

    // Listen for message read
    const cleanupMessageRead = chatSocketService.onMessageRead((data) => {
      console.log('[ChatContext] Message read:', data);
      setMessages((prev) => {
        const chatMessages = prev[data.chatId] || [];
        return {
          ...prev,
          [data.chatId]: chatMessages.map((msg) =>
            msg.messageId === data.messageId
              ? {
                  ...msg,
                  deliveryStatus: MessageDeliveryStatus.READ,
                  readAt: new Date(),
                  readBy: data.readBy,
                }
              : msg
          ),
        };
      });
    });

    if (cleanupMessageRead) {
      socketListenersRef.current.push(cleanupMessageRead);
    }

    // Listen for typing indicators
    const cleanupTyping = chatSocketService.onTyping((data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const currentTyping = prev[data.chatId] || [];
          if (!currentTyping.includes(data.userId)) {
            return {
              ...prev,
              [data.chatId]: [...currentTyping, data.userId],
            };
          }
          return prev;
        });
      }
    });

    if (cleanupTyping) {
      socketListenersRef.current.push(cleanupTyping);
    }

    // Listen for typing stopped
    const cleanupTypingStopped = chatSocketService.onTypingStopped((data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const currentTyping = prev[data.chatId] || [];
          return {
            ...prev,
            [data.chatId]: currentTyping.filter((id) => id !== data.userId),
          };
        });
      }
    });

    if (cleanupTypingStopped) {
      socketListenersRef.current.push(cleanupTypingStopped);
    }

    // Listen for unread count updates
    const cleanupUnreadCountUpdated = chatSocketService.onUnreadCountUpdated((data) => {
      console.log('[ChatContext] Unread count updated:', data);
      setUnreadCounts((prev) => ({
        ...prev,
        [data.chatId]: data.unreadCount,
      }));
      setTotalUnreadCount(data.totalUnreadCount);
    });

    if (cleanupUnreadCountUpdated) {
      socketListenersRef.current.push(cleanupUnreadCountUpdated);
    }

    // Cleanup on unmount or disconnect
    return () => {
      socketListenersRef.current.forEach((cleanup) => cleanup());
      socketListenersRef.current = [];
    };
  }, [isConnected, currentUserId, isNetworkConnected, refreshChats]);

  /**
   * Load messages for a specific chat
   */
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const response = await chatService.getChatMessages({ chatId, page: 1, limit: 50 });
      setMessages((prev) => ({
        ...prev,
        [chatId]: response.messages,
      }));

      // Save to storage
      await chatStorage.saveMessages(chatId, response.messages);
    } catch (err) {
      console.error('[ChatContext] Error loading messages:', err);
      throw err;
    }
  }, []);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (chatId: string, content: string) => {
      if (!content.trim()) {
        return;
      }

      try {
        // Optimistically add message to UI
        const tempMessage: Message = {
          messageId: `temp-${Date.now()}`,
          chatId,
          senderId: currentUserId,
          content: content.trim(),
          deliveryStatus: MessageDeliveryStatus.SENT,
          createdAt: new Date(),
        };

        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), tempMessage],
        }));

        // If offline, queue the message
        if (!canSendMessages) {
          console.log('[ChatContext] Offline - queueing message');
          await offlineQueueService.enqueue({
            type: QueueItemType.SEND_MESSAGE,
            chatId,
            content: content.trim(),
          });
          // Keep temp message in UI with pending status
          return;
        }

        // Send via socket when online
        chatSocketService.sendMessage(
          { chatId, content: content.trim() },
          (message) => {
            // Replace temp message with real message
            setMessages((prev) => {
              const chatMessages = prev[chatId] || [];
              return {
                ...prev,
                [chatId]: chatMessages
                  .filter((m) => m.messageId !== tempMessage.messageId)
                  .concat(message),
              };
            });

            // Save to storage
            chatStorage.saveMessage(chatId, message).catch(console.error);
          },
          async (error) => {
            console.error('[ChatContext] Error sending message:', error);
            // Queue message if send failed
            await offlineQueueService.enqueue({
              type: QueueItemType.SEND_MESSAGE,
              chatId,
              content: content.trim(),
            });
            // Keep temp message in UI
          }
        );
      } catch (err) {
        console.error('[ChatContext] Error sending message:', err);
        throw err;
      }
    },
    [currentUserId, canSendMessages]
  );

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      // Update local state immediately (optimistic update)
      setMessages((prev) => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.map((msg) =>
            msg.senderId !== currentUserId && msg.deliveryStatus !== MessageDeliveryStatus.READ
              ? {
                  ...msg,
                  deliveryStatus: MessageDeliveryStatus.READ,
                  readAt: new Date(),
                  readBy: currentUserId,
                }
              : msg
          ),
        };
      });

      setUnreadCounts((prev) => ({
        ...prev,
        [chatId]: 0,
      }));

      // If offline, queue the action
      if (!canSendMessages) {
        console.log('[ChatContext] Offline - queueing mark as read');
        await offlineQueueService.enqueue({
          type: QueueItemType.MARK_AS_READ,
          chatId,
        });
        return;
      }

      // Mark as read via API and socket when online
      await chatService.markMessagesAsRead(chatId);
      chatSocketService.markAsRead(chatId);

      // Update storage
      setMessages((prev) => {
        const updatedMessages = prev[chatId] || [];
        chatStorage.saveMessages(chatId, updatedMessages).catch(console.error);
        return prev;
      });
    } catch (err) {
      console.error('[ChatContext] Error marking messages as read:', err);
      // Queue if failed
      if (!canSendMessages) {
        await offlineQueueService.enqueue({
          type: QueueItemType.MARK_AS_READ,
          chatId,
        });
      }
      throw err;
    }
  }, [currentUserId, canSendMessages]);

  /**
   * Join a chat room
   */
  const joinChat = useCallback(async (chatId: string) => {
    try {
      chatSocketService.joinChat(
        chatId,
        () => {
          console.log('[ChatContext] Joined chat:', chatId);
          // Load messages when joining
          loadMessages(chatId).catch(console.error);
          // Mark as read when joining
          markAsRead(chatId).catch(console.error);
        },
        (error) => {
          console.error('[ChatContext] Error joining chat:', error);
        }
      );
    } catch (err) {
      console.error('[ChatContext] Error joining chat:', err);
    }
  }, [loadMessages, markAsRead]);

  /**
   * Leave a chat room
   */
  const leaveChat = useCallback(async (chatId: string) => {
    try {
      chatSocketService.leaveChat(
        chatId,
        () => {
          console.log('[ChatContext] Left chat:', chatId);
        },
        (error) => {
          console.error('[ChatContext] Error leaving chat:', error);
        }
      );
    } catch (err) {
      console.error('[ChatContext] Error leaving chat:', err);
    }
  }, []);

  /**
   * Set active chat
   */
  const setActiveChat = useCallback(
    (chatId: string | null) => {
      if (activeChatId && activeChatId !== chatId) {
        // Leave previous chat
        leaveChat(activeChatId).catch(console.error);
      }

      setActiveChatId(chatId);

      if (chatId) {
        // Join new chat
        joinChat(chatId).catch(console.error);
      }
    },
    [activeChatId, joinChat, leaveChat]
  );

  const value: ChatContextState = {
    chats,
    activeChatId,
    messages,
    typingUsers,
    unreadCounts,
    totalUnreadCount,
    isLoading,
    error,
    setActiveChat,
    refreshChats,
    loadMessages,
    sendMessage,
    markAsRead,
    joinChat,
    leaveChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * Hook to use chat context
 */
export const useChat = (): ChatContextState => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

