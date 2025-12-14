/**
 * Chat Utilities
 * Helper functions for chat data transformation, validation, and formatting
 */

import type { Chat, Message } from '../types/chat';

/**
 * Transform date strings to Date objects for Message
 */
export const transformMessageDates = (message: any): Message => {
  return {
    ...message,
    createdAt: new Date(message.createdAt),
    readAt: message.readAt ? new Date(message.readAt) : undefined,
  };
};

/**
 * Transform date strings to Date objects for Chat
 */
export const transformChatDates = (chat: any): Chat => {
  return {
    ...chat,
    createdAt: new Date(chat.createdAt),
    updatedAt: new Date(chat.updatedAt),
  };
};

/**
 * Validate message content
 */
export const validateMessageContent = (content: string): { valid: boolean; error?: string } => {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }
  
  return { valid: true };
};

/**
 * Format timestamp for display
 */
export const formatMessageTime = (date: Date): string => {
  try {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Today - show time only
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      // Yesterday
      return `Yesterday ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older - show date and time
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  } catch {
    return '';
  }
};

