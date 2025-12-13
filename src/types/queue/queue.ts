/**
 * Queue Types
 * Types for offline queue service
 */

/**
 * Queue item types enumeration
 */
export enum QueueItemType {
  SEND_MESSAGE = 'send_message',
  MARK_AS_READ = 'mark_as_read',
}

/**
 * Base queue item interface
 */
export interface BaseQueueItem {
  id: string;
  type: QueueItemType;
  timestamp: string;
  retryCount: number;
}

/**
 * Send message queue item
 */
export interface SendMessageQueueItem extends BaseQueueItem {
  type: QueueItemType.SEND_MESSAGE;
  chatId: string;
  content: string;
  contextType?: string;
  contextId?: string;
}

/**
 * Mark as read queue item
 */
export interface MarkAsReadQueueItem extends BaseQueueItem {
  type: QueueItemType.MARK_AS_READ;
  chatId: string;
}

/**
 * Union type for all queue items
 */
export type QueueItem = SendMessageQueueItem | MarkAsReadQueueItem;

/**
 * Queue sync result
 */
export interface QueueSyncResult {
  success: number;
  failed: number;
  errors: { item: QueueItem; error: string }[];
}

