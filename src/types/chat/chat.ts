/**
 * Participant type enumeration matching server ParticipantType
 */
export enum ParticipantType {
  ADMIN_USER = 'admin_user',
  ADMIN_DRIVER = 'admin_driver',
  DRIVER_USER = 'driver_user',
}

/**
 * Message delivery status enumeration matching server MessageDeliveryStatus
 */
export enum MessageDeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

/**
 * Chat participant interface
 */
export interface ChatParticipant {
  userId: string;
  participantType: ParticipantType;
}

/**
 * Chat interface matching server ChatResponse
 */
export interface Chat {
  chatId: string;
  contextType: string;
  contextId: string;
  participantType: ParticipantType;
  participants: ChatParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message interface matching server MessageResponse
 */
export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string;
  deliveryStatus: MessageDeliveryStatus;
  createdAt: Date;
  readAt?: Date;
  readBy?: string;
}

/**
 * Chat list response matching server ChatListResponse
 */
export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

/**
 * Message list response matching server MessageListResponse
 */
export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Request parameters for getting messages
 */
export interface GetMessagesParams {
  chatId: string;
  page?: number;
  limit?: number;
}

/**
 * Request for creating a chat
 */
export interface CreateChatRequest {
  contextType: string;
  contextId: string;
  participantType: ParticipantType;
  participants: ChatParticipant[];
}

/**
 * Request for sending a message
 */
export interface SendMessageRequest {
  chatId?: string;
  contextType?: string;
  contextId?: string;
  content: string;
}

/**
 * Request for getting chat by context
 */
export interface GetChatByContextParams {
  contextType: string;
  contextId: string;
}

/**
 * Unread message count response
 */
export interface UnreadMessageCountResponse {
  chatId: string;
  unreadCount: number;
}

/**
 * Total unread message count response
 */
export interface TotalUnreadMessageCountResponse {
  totalUnreadCount: number;
}

/**
 * Mark message as read response
 */
export interface MarkMessageAsReadResponse {
  message: string;
  unreadCount: number;
}

