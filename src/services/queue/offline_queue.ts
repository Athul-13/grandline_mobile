/**
 * Offline Queue Service
 * Manages queued actions (messages, mark-as-read) when offline
 * Syncs queue when connection is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '../api/chat_service';
import { chatSocketService } from '../socket/chat_socket_service';

/**
 * Storage key for offline queue
 */
const OFFLINE_QUEUE_KEY = '@grandline:offline_queue';

/**
 * Queue item types
 */
export enum QueueItemType {
  SEND_MESSAGE = 'send_message',
  MARK_AS_READ = 'mark_as_read',
}

/**
 * Base queue item interface
 */
interface BaseQueueItem {
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

/**
 * Offline Queue Service
 * Handles queuing and syncing of offline actions
 */
export const offlineQueueService = {
  /**
   * Add item to offline queue
   */
  async enqueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const queueItem: QueueItem = {
        ...item,
        id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      } as QueueItem;
      queue.push(queueItem);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('[OfflineQueue] Item queued:', queueItem.id, queueItem.type);
    } catch (error) {
      console.error('[OfflineQueue] Error enqueueing item:', error);
      throw error;
    }
  },

  /**
   * Get all queued items
   */
  async getQueue(): Promise<QueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as QueueItem[];
    } catch (error) {
      console.error('[OfflineQueue] Error getting queue:', error);
      return [];
    }
  },

  /**
   * Remove item from queue
   */
  async dequeue(itemId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
      console.log('[OfflineQueue] Item dequeued:', itemId);
    } catch (error) {
      console.error('[OfflineQueue] Error dequeuing item:', error);
      throw error;
    }
  },

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log('[OfflineQueue] Queue cleared');
    } catch (error) {
      console.error('[OfflineQueue] Error clearing queue:', error);
      throw error;
    }
  },

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  },

  /**
   * Sync queue with server
   * Processes all queued items when connection is restored
   */
  async syncQueue(): Promise<QueueSyncResult> {
    const result: QueueSyncResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const queue = await this.getQueue();
    if (queue.length === 0) {
      console.log('[OfflineQueue] Queue is empty, nothing to sync');
      return result;
    }

    console.log(`[OfflineQueue] Syncing ${queue.length} queued items...`);

    // Process items in order
    for (const item of queue) {
      try {
        // Skip items that have been retried too many times
        if (item.retryCount >= 3) {
          console.warn(`[OfflineQueue] Skipping item ${item.id} (max retries reached)`);
          result.failed++;
          result.errors.push({
            item,
            error: 'Max retries reached',
          });
          await this.dequeue(item.id);
          continue;
        }

        let success = false;

        switch (item.type) {
          case QueueItemType.SEND_MESSAGE:
            success = await this.processSendMessage(item);
            break;
          case QueueItemType.MARK_AS_READ:
            success = await this.processMarkAsRead(item);
            break;
          default: {
            const unknownItem = item as QueueItem;
            console.warn(`[OfflineQueue] Unknown queue item type: ${unknownItem.type}`);
            result.failed++;
            result.errors.push({
              item: unknownItem,
              error: 'Unknown item type',
            });
            await this.dequeue(unknownItem.id);
            continue;
          }
        }

        if (success) {
          result.success++;
          await this.dequeue(item.id);
        } else {
          // Increment retry count
          item.retryCount++;
          await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
          result.failed++;
          result.errors.push({
            item,
            error: 'Processing failed',
          });
        }
      } catch (error) {
        console.error(`[OfflineQueue] Error processing item ${item.id}:`, error);
        item.retryCount++;
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        result.failed++;
        result.errors.push({
          item,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[OfflineQueue] Sync complete: ${result.success} succeeded, ${result.failed} failed`);
    return result;
  },

  /**
   * Process send message queue item
   */
  async processSendMessage(item: SendMessageQueueItem): Promise<boolean> {
    try {
      // Send via socket (messages are only sent via socket)
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error(`[OfflineQueue] Socket send timeout for ${item.id}`);
          resolve(false);
        }, 10000); // 10 second timeout

        chatSocketService.sendMessage(
          {
            chatId: item.chatId,
            contextType: item.contextType,
            contextId: item.contextId,
            content: item.content,
          },
          () => {
            clearTimeout(timeout);
            console.log(`[OfflineQueue] Message sent successfully: ${item.id}`);
            resolve(true);
          },
          (error) => {
            clearTimeout(timeout);
            console.error(`[OfflineQueue] Socket send failed for ${item.id}:`, error);
            resolve(false);
          }
        );
      });
    } catch (error) {
      console.error(`[OfflineQueue] Error processing send message ${item.id}:`, error);
      return false;
    }
  },

  /**
   * Process mark as read queue item
   */
  async processMarkAsRead(item: MarkAsReadQueueItem): Promise<boolean> {
    try {
      // Try REST API first (more reliable for mark-as-read)
      await chatService.markMessagesAsRead(item.chatId);
      console.log(`[OfflineQueue] Mark as read successful: ${item.id}`);
      return true;
    } catch (error) {
      console.error(`[OfflineQueue] Error processing mark as read ${item.id}:`, error);
      return false;
    }
  },
};

