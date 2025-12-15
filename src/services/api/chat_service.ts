import { API_ENDPOINTS } from '../../constants/api';
import type {
  Chat,
  ChatListResponse,
  CreateChatRequest,
  GetChatByContextParams,
  GetMessagesParams,
  MessageListResponse,
  TotalUnreadMessageCountResponse,
  UnreadMessageCountResponse
} from '../../types/chat';
import { transformChatDates, transformMessageDates } from '../../utils/chat_utils';
import { grandlineAxiosClient } from './axios_client';

/**
 * Chat API Service
 * Handles all REST API calls related to chats
 */
export const chatService = {
  /**
   * Get all chats for the authenticated user
   */
  async getChats(): Promise<ChatListResponse> {
    const response = await grandlineAxiosClient.get<ChatListResponse>(API_ENDPOINTS.CHAT.LIST);
    return {
      ...response.data,
      chats: response.data.chats.map(transformChatDates),
    };
  },

  /**
   * Get chat by context (contextType and contextId)
   */
  async getChatByContext(params: GetChatByContextParams): Promise<{ chat: Chat | null }> {
    const response = await grandlineAxiosClient.get<{ chat: Chat | null }>(
      API_ENDPOINTS.CHAT.BY_CONTEXT,
      {
        params: {
          contextType: params.contextType,
          contextId: params.contextId,
        },
      }
    );
    return {
      chat: response.data.chat ? transformChatDates(response.data.chat) : null,
    };
  },

  /**
   * Create a new chat
   */
  async createChat(request: CreateChatRequest): Promise<Chat> {
    const response = await grandlineAxiosClient.post<Chat>(API_ENDPOINTS.CHAT.CREATE, request);
    return response.data;
  },

  /**
   * Get messages for a specific chat with pagination
   */
  async getChatMessages(params: GetMessagesParams): Promise<MessageListResponse> {
    const response = await grandlineAxiosClient.get<MessageListResponse>(
      API_ENDPOINTS.MESSAGES.GET_CHAT_MESSAGES(params.chatId),
      {
        params: {
          page: params.page,
          limit: params.limit,
        },
      }
    );
    return {
      ...response.data,
      messages: response.data.messages.map(transformMessageDates),
    };
  },

  /**
   * Get unread message count for a specific chat
   */
  async getChatUnreadCount(chatId: string): Promise<UnreadMessageCountResponse> {
    const response = await grandlineAxiosClient.get<UnreadMessageCountResponse>(
      API_ENDPOINTS.MESSAGES.CHAT_UNREAD_COUNT(chatId)
    );
    return response.data;
  },

  /**
   * Get total unread message count across all chats
   */
  async getTotalUnreadCount(): Promise<TotalUnreadMessageCountResponse> {
    const response = await grandlineAxiosClient.get<TotalUnreadMessageCountResponse>(
      API_ENDPOINTS.MESSAGES.TOTAL_UNREAD_COUNT
    );
    return response.data;
  },
};

