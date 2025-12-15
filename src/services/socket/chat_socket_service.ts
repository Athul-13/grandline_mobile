/**
 * Chat Socket Service
 * Handles chat-related Socket.io events for mobile app
 */

import type {
    JoinChatRequest,
    JoinChatResponse,
    LeaveChatRequest,
    LeaveChatResponse,
    MarkAsReadSocketRequest,
    MessageDeliveredEvent,
    MessageReadEvent,
    MessageSentEvent,
    SendMessageSocketRequest,
    SocketError,
    TypingEvent,
    TypingStartRequest,
    TypingStoppedEvent,
    TypingStopRequest,
    UnreadCountUpdatedEvent,
    UserOfflineEvent,
    UserOnlineEvent,
} from '../../types/chat/chat_socket_events';
import { getSocketInstance } from './socket_client';

/**
 * Socket event names for chat (matching server)
 */
export const CHAT_SOCKET_EVENTS = {
  // Client -> Server
  JOIN_CHAT: 'join-chat',
  LEAVE_CHAT: 'leave-chat',
  SEND_MESSAGE: 'send-message',
  MARK_AS_READ: 'mark-as-read',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  // Server -> Client
  CHAT_JOINED: 'chat-joined',
  CHAT_LEFT: 'chat-left',
  CHAT_CREATED: 'chat-created',
  MESSAGE_SENT: 'message-sent',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_READ: 'message-read',
  TYPING: 'typing',
  TYPING_STOPPED: 'typing-stopped',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  UNREAD_COUNT_UPDATED: 'unread-count-updated',
  ERROR: 'error',
} as const;

/**
 * Chat Socket Service
 * Provides methods for chat-related socket operations
 */
export const chatSocketService = {
  /**
   * Join a chat room
   * Client → Server: join-chat
   * Server → Client: chat-joined
   */
  joinChat: (
    chatId: string,
    onJoined?: (data: JoinChatResponse) => void,
    onError?: (error: SocketError) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      onError?.({ message: 'Socket not connected', code: 'NOT_CONNECTED' });
      return null;
    }

    const handleJoined = (data: JoinChatResponse) => {
      socket.off(CHAT_SOCKET_EVENTS.CHAT_JOINED, handleJoined);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onJoined?.(data);
    };

    const handleError = (error: SocketError) => {
      socket.off(CHAT_SOCKET_EVENTS.CHAT_JOINED, handleJoined);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onError?.(error);
    };

    socket.once(CHAT_SOCKET_EVENTS.CHAT_JOINED, handleJoined);
    socket.once(CHAT_SOCKET_EVENTS.ERROR, handleError);

    socket.emit(CHAT_SOCKET_EVENTS.JOIN_CHAT, { chatId } as JoinChatRequest);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.CHAT_JOINED, handleJoined);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
    };
  },

  /**
   * Leave a chat room
   * Client → Server: leave-chat
   * Server → Client: chat-left
   */
  leaveChat: (
    chatId: string,
    onLeft?: (data: LeaveChatResponse) => void,
    onError?: (error: SocketError) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      onError?.({ message: 'Socket not connected', code: 'NOT_CONNECTED' });
      return null;
    }

    const handleLeft = (data: LeaveChatResponse) => {
      socket.off(CHAT_SOCKET_EVENTS.CHAT_LEFT, handleLeft);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onLeft?.(data);
    };

    const handleError = (error: SocketError) => {
      socket.off(CHAT_SOCKET_EVENTS.CHAT_LEFT, handleLeft);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onError?.(error);
    };

    socket.once(CHAT_SOCKET_EVENTS.CHAT_LEFT, handleLeft);
    socket.once(CHAT_SOCKET_EVENTS.ERROR, handleError);

    socket.emit(CHAT_SOCKET_EVENTS.LEAVE_CHAT, { chatId } as LeaveChatRequest);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.CHAT_LEFT, handleLeft);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
    };
  },

  /**
   * Send a message via socket
   * Client → Server: send-message
   * Server → Client: message-sent
   */
  sendMessage: (
    data: SendMessageSocketRequest,
    onSent?: (message: MessageSentEvent) => void,
    onError?: (error: SocketError) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      onError?.({ message: 'Socket not connected', code: 'NOT_CONNECTED' });
      return null;
    }

    const handleSent = (message: MessageSentEvent) => {
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_SENT, handleSent);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onSent?.(message);
    };

    const handleError = (error: SocketError) => {
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_SENT, handleSent);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onError?.(error);
    };

    socket.once(CHAT_SOCKET_EVENTS.MESSAGE_SENT, handleSent);
    socket.once(CHAT_SOCKET_EVENTS.ERROR, handleError);

    socket.emit(CHAT_SOCKET_EVENTS.SEND_MESSAGE, data);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_SENT, handleSent);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
    };
  },

  /**
   * Listen for new messages
   * Server → Client: message-sent
   */
  onMessageSent: (callback: (message: MessageSentEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_SENT, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.MESSAGE_SENT, callback);
  },

  /**
   * Listen for message delivered (double gray tick)
   * Server → Client: message-delivered
   */
  onMessageDelivered: (callback: (data: MessageDeliveredEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_DELIVERED, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.MESSAGE_DELIVERED, callback);
  },

  /**
   * Listen for message read (double blue tick)
   * Server → Client: message-read
   */
  onMessageRead: (callback: (data: MessageReadEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_READ, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.MESSAGE_READ, callback);
  },

  /**
   * Start typing indicator
   * Client → Server: typing-start
   */
  startTyping: (chatId: string): void => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return;
    }

    socket.emit(CHAT_SOCKET_EVENTS.TYPING_START, { chatId } as TypingStartRequest);
  },

  /**
   * Stop typing indicator
   * Client → Server: typing-stop
   */
  stopTyping: (chatId: string): void => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return;
    }

    socket.emit(CHAT_SOCKET_EVENTS.TYPING_STOP, { chatId } as TypingStopRequest);
  },

  /**
   * Listen for typing indicator
   * Server → Client: typing
   */
  onTyping: (callback: (data: TypingEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.TYPING, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.TYPING, callback);
  },

  /**
   * Listen for typing stopped
   * Server → Client: typing-stopped
   */
  onTypingStopped: (callback: (data: TypingStoppedEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.TYPING_STOPPED, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.TYPING_STOPPED, callback);
  },

  /**
   * Mark messages as read via socket
   * Client → Server: mark-as-read
   * Server → Client: message-read (emitted for all messages in chat)
   */
  markAsRead: (
    chatId: string,
    onRead?: (data: MessageReadEvent) => void,
    onError?: (error: SocketError) => void
  ): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      onError?.({ message: 'Socket not connected', code: 'NOT_CONNECTED' });
      return null;
    }

    const handleRead = (data: MessageReadEvent) => {
      if (data.chatId === chatId) {
        onRead?.(data);
      }
    };

    const handleError = (error: SocketError) => {
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_READ, handleRead);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
      onError?.(error);
    };

    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_READ, handleRead);
    socket.once(CHAT_SOCKET_EVENTS.ERROR, handleError);

    socket.emit(CHAT_SOCKET_EVENTS.MARK_AS_READ, { chatId } as MarkAsReadSocketRequest);

    // Return cleanup function
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_READ, handleRead);
      socket.off(CHAT_SOCKET_EVENTS.ERROR, handleError);
    };
  },

  /**
   * Listen for user online event
   * Server → Client: user-online
   */
  onUserOnline: (callback: (data: UserOnlineEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.USER_ONLINE, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.USER_ONLINE, callback);
  },

  /**
   * Listen for user offline event
   * Server → Client: user-offline
   */
  onUserOffline: (callback: (data: UserOfflineEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.USER_OFFLINE, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.USER_OFFLINE, callback);
  },

  /**
   * Listen for unread count updates
   * Server → Client: unread-count-updated
   */
  onUnreadCountUpdated: (callback: (data: UnreadCountUpdatedEvent) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.UNREAD_COUNT_UPDATED, callback);
  },

  /**
   * Listen for socket errors
   * Server → Client: error
   */
  onError: (callback: (error: SocketError) => void): (() => void) | null => {
    const socket = getSocketInstance();
    if (!socket) {
      console.warn('[ChatSocketService] Socket not available');
      return null;
    }

    socket.on(CHAT_SOCKET_EVENTS.ERROR, callback);
    return () => socket.off(CHAT_SOCKET_EVENTS.ERROR, callback);
  },
};

