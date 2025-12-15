import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAT_STORAGE_KEYS } from '../../constants/storage';
import type { Chat, Message } from '../../types/chat';

/**
 * Chat Storage Service
 * Handles local persistence of chats and messages using AsyncStorage
 */
export const chatStorage = {
  /**
   * Save chats to local storage
   */
  async saveChats(chats: Chat[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('[ChatStorage] Error saving chats:', error);
      throw error;
    }
  },

  /**
   * Get chats from local storage
   */
  async getChats(): Promise<Chat[]> {
    try {
      const data = await AsyncStorage.getItem(CHAT_STORAGE_KEYS.CHATS);
      if (!data) {
        return [];
      }
      const chats = JSON.parse(data) as Chat[];
      // Convert date strings back to Date objects
      return chats.map((chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
      }));
    } catch (error) {
      console.error('[ChatStorage] Error getting chats:', error);
      return [];
    }
  },

  /**
   * Get a specific chat by ID from local storage
   */
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const chats = await this.getChats();
      return chats.find((chat) => chat.chatId === chatId) || null;
    } catch (error) {
      console.error('[ChatStorage] Error getting chat:', error);
      return null;
    }
  },

  /**
   * Add or update a chat in local storage
   */
  async saveChat(chat: Chat): Promise<void> {
    try {
      const chats = await this.getChats();
      const existingIndex = chats.findIndex((c) => c.chatId === chat.chatId);

      if (existingIndex >= 0) {
        // Update existing chat
        chats[existingIndex] = chat;
      } else {
        // Add new chat
        chats.push(chat);
      }

      await this.saveChats(chats);
    } catch (error) {
      console.error('[ChatStorage] Error saving chat:', error);
      throw error;
    }
  },

  /**
   * Save messages for a specific chat to local storage
   */
  async saveMessages(chatId: string, messages: Message[]): Promise<void> {
    try {
      const key = CHAT_STORAGE_KEYS.MESSAGES(chatId);
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('[ChatStorage] Error saving messages:', error);
      throw error;
    }
  },

  /**
   * Get messages for a specific chat from local storage
   */
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const key = CHAT_STORAGE_KEYS.MESSAGES(chatId);
      const data = await AsyncStorage.getItem(key);
      if (!data) {
        return [];
      }
      const messages = JSON.parse(data) as Message[];
      // Convert date strings back to Date objects
      return messages.map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt),
        readAt: message.readAt ? new Date(message.readAt) : undefined,
      }));
    } catch (error) {
      console.error('[ChatStorage] Error getting messages:', error);
      return [];
    }
  },

  /**
   * Add or update a message in local storage
   */
  async saveMessage(chatId: string, message: Message): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      const existingIndex = messages.findIndex((m) => m.messageId === message.messageId);

      if (existingIndex >= 0) {
        // Update existing message
        messages[existingIndex] = message;
      } else {
        // Add new message at the end (most recent)
        messages.push(message);
      }

      await this.saveMessages(chatId, messages);
    } catch (error) {
      console.error('[ChatStorage] Error saving message:', error);
      throw error;
    }
  },

  /**
   * Queue a message for sending when offline
   */
  async queueMessage(chatId: string, message: Omit<Message, 'messageId' | 'createdAt' | 'deliveryStatus'>): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        chatId,
        message,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(CHAT_STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('[ChatStorage] Error queueing message:', error);
      throw error;
    }
  },

  /**
   * Get offline message queue
   */
  async getOfflineQueue(): Promise<{
    chatId: string;
    message: Omit<Message, 'messageId' | 'createdAt' | 'deliveryStatus'>;
    timestamp: string;
  }[]> {
    try {
      const data = await AsyncStorage.getItem(CHAT_STORAGE_KEYS.OFFLINE_QUEUE);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('[ChatStorage] Error getting offline queue:', error);
      return [];
    }
  },

  /**
   * Clear offline message queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (error) {
      console.error('[ChatStorage] Error clearing offline queue:', error);
      throw error;
    }
  },

  /**
   * Save last sync timestamp
   */
  async saveLastSync(timestamp: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEYS.LAST_SYNC, timestamp.toISOString());
    } catch (error) {
      console.error('[ChatStorage] Error saving last sync:', error);
      throw error;
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(CHAT_STORAGE_KEYS.LAST_SYNC);
      if (!data) {
        return null;
      }
      return new Date(data);
    } catch (error) {
      console.error('[ChatStorage] Error getting last sync:', error);
      return null;
    }
  },

  /**
   * Clear all chat data from local storage
   */
  async clearAll(): Promise<void> {
    try {
      const chats = await this.getChats();
      // Remove all message keys
      const messageKeys = chats.map((chat) => CHAT_STORAGE_KEYS.MESSAGES(chat.chatId));
      await AsyncStorage.multiRemove([
        CHAT_STORAGE_KEYS.CHATS,
        CHAT_STORAGE_KEYS.LAST_SYNC,
        CHAT_STORAGE_KEYS.OFFLINE_QUEUE,
        ...messageKeys,
      ]);
    } catch (error) {
      console.error('[ChatStorage] Error clearing chats:', error);
      throw error;
    }
  },
};

