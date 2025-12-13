import type { Chat, Message } from './chat';

/**
 * Socket event types for chat
 */

/**
 * Socket Error
 */
export interface SocketError {
  message: string;
  code?: string;
}

// ==================== Chat Socket Events ====================

/**
 * Join Chat Request
 * Client → Server: join-chat
 */
export interface JoinChatRequest {
  chatId: string;
}

/**
 * Join Chat Response
 * Server → Client: chat-joined
 */
export interface JoinChatResponse {
  chatId: string;
}

/**
 * Leave Chat Request
 * Client → Server: leave-chat
 */
export interface LeaveChatRequest {
  chatId: string;
}

/**
 * Leave Chat Response
 * Server → Client: chat-left
 */
export interface LeaveChatResponse {
  chatId: string;
}

/**
 * Chat Created Event
 * Server → Client: chat-created
 */
export type ChatCreatedEvent = Chat;

/**
 * User Online Event
 * Server → Client: user-online
 */
export interface UserOnlineEvent {
  userId: string;
  chatId: string;
}

/**
 * User Offline Event
 * Server → Client: user-offline
 */
export interface UserOfflineEvent {
  userId: string;
  chatId: string;
}

// ==================== Message Socket Events ====================

/**
 * Send Message via Socket Request
 * Client → Server: send-message
 */
export interface SendMessageSocketRequest {
  chatId?: string;
  contextType?: string;
  contextId?: string;
  content: string;
}

/**
 * Message Sent Event
 * Server → Client: message-sent
 */
export type MessageSentEvent = Message;

/**
 * Message Delivered Event
 * Server → Client: message-delivered
 */
export interface MessageDeliveredEvent {
  messageId: string;
  chatId: string;
}

/**
 * Message Read Event
 * Server → Client: message-read
 */
export interface MessageReadEvent {
  messageId: string;
  chatId: string;
  readBy: string;
}

/**
 * Typing Start Request
 * Client → Server: typing-start
 */
export interface TypingStartRequest {
  chatId: string;
}

/**
 * Typing Stop Request
 * Client → Server: typing-stop
 */
export interface TypingStopRequest {
  chatId: string;
}

/**
 * Typing Event
 * Server → Client: typing
 */
export interface TypingEvent {
  chatId: string;
  userId: string;
}

/**
 * Typing Stopped Event
 * Server → Client: typing-stopped
 */
export interface TypingStoppedEvent {
  chatId: string;
  userId: string;
}

/**
 * Mark as Read via Socket Request
 * Client → Server: mark-as-read
 */
export interface MarkAsReadSocketRequest {
  chatId: string;
}

/**
 * Unread Count Updated Event
 * Server → Client: unread-count-updated
 */
export interface UnreadCountUpdatedEvent {
  chatId: string;
  unreadCount: number;
  totalUnreadCount: number;
}

