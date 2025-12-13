/**
 * Offline Queue Service
 * Manages queued actions (messages, mark-as-read) when offline
 * Syncs queue when connection is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUEUE_MAX_RETRY_COUNT, QUEUE_SOCKET_SEND_TIMEOUT } from '../../constants/queue';
import { OFFLINE_QUEUE_STORAGE_KEY } from '../../constants/storage';
import type {
    MarkAsReadQueueItem,
    QueueItem,
    QueueSyncResult,
    SendMessageQueueItem,
} from '../../types/queue';
import { QueueItemType } from '../../types/queue';
import { chatService } from '../api/chat_service';
import { chatSocketService } from '../socket/chat_socket_service';

// Re-export types for backward compatibility
export { QueueItemType };
export type { MarkAsReadQueueItem, QueueItem, QueueSyncResult, SendMessageQueueItem };

/**
 * Offline Queue Service
 * Handles queuing and syncing of offline actions
 */
export const offlineQueueService = {
  /**
   * Add item to offline queue
   */
  async enqueue(
    item: Omit<SendMessageQueueItem, 'id' | 'timestamp' | 'retryCount'> | Omit<MarkAsReadQueueItem, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<void> {
    try {
      const queue = await this.getQueue();
      const queueItem: QueueItem = {
        ...item,
        id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      } as QueueItem;
      queue.push(queueItem);
      await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
      console.log('[OfflineQueue] Item queued:', queueItem.id, queueItem.type);
    } catch (error) {
      console.error('[OfflineQueue] Error enqueueing item:', error);
      throw error;
    }
  },

  /**
   * Get all queued items
   * 
   * @returns {Promise<QueueItem[]>} Array of queued items
   */
  async getQueue(): Promise<QueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
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
   * 
   * @param {string} itemId - ID of item to remove
   * @returns {Promise<void>}
   * @throws {Error} If removal fails
   */
  async dequeue(itemId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(filtered));
      console.log('[OfflineQueue] Item dequeued:', itemId);
    } catch (error) {
      console.error('[OfflineQueue] Error dequeuing item:', error);
      throw error;
    }
  },

  /**
   * Clear entire queue
   * 
   * Removes all queued items from storage.
   * 
   * @returns {Promise<void>}
   * @throws {Error} If clearing fails
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
      console.log('[OfflineQueue] Queue cleared');
    } catch (error) {
      console.error('[OfflineQueue] Error clearing queue:', error);
      throw error;
    }
  },

  /**
   * Get queue size
   * 
   * @returns {Promise<number>} Number of items in queue
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  },

  /**
   * Sync queue with server
   * 
   * Processes all queued items when connection is restored.
   * Items are processed in order, with retry logic for failures.
   * Items that exceed max retry count are removed from queue.
   * 
   * @returns {Promise<QueueSyncResult>} Sync result with success/failure counts
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
        if (item.retryCount >= QUEUE_MAX_RETRY_COUNT) {
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
          await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
          result.failed++;
          result.errors.push({
            item,
            error: 'Processing failed',
          });
        }
      } catch (error) {
        console.error(`[OfflineQueue] Error processing item ${item.id}:`, error);
        item.retryCount++;
        await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
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
   * 
   * Sends a queued message via socket connection.
   * 
   * @param {SendMessageQueueItem} item - Message item to process
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async processSendMessage(item: SendMessageQueueItem): Promise<boolean> {
    try {
      // Send via socket (messages are only sent via socket)
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error(`[OfflineQueue] Socket send timeout for ${item.id}`);
          resolve(false);
        }, QUEUE_SOCKET_SEND_TIMEOUT);

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
   * 
   * Marks messages as read via REST API.
   * 
   * @param {MarkAsReadQueueItem} item - Mark as read item to process
   * @returns {Promise<boolean>} True if successful, false otherwise
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

