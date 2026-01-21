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
 * Format time only (locale-aware, 12h or 24h based on device locale)
 */
export const formatMessageTime = (date: Date | string): string => {
  try {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(messageDate.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(messageDate);
  } catch {
    return '';
  }
};

/**
 * Get date label for date separator (Today / Yesterday / formatted date)
 */
export const getDateLabel = (date: Date): string => {
  try {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      // Format date (locale-aware)
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      }).format(messageDate);
    }
  } catch {
    return '';
  }
};

/**
 * Check if two dates are on different days
 */
export const isDifferentDay = (date1: Date, date2: Date): boolean => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  } catch {
    return false;
  }
};

