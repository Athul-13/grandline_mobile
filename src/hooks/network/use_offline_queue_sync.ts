/**
 * Offline Queue Sync Hook
 * Automatically syncs offline queue when network connection is restored
 */

import { useEffect, useRef } from 'react';
import { useNetworkStatus } from './use_network_status';
import { offlineQueueService } from '../../services/queue/offline_queue';

/**
 * Hook to automatically sync offline queue when connection is restored
 */
export const useOfflineQueueSync = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const hasSyncedRef = useRef(false);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    // Only sync when both connected and internet is reachable
    const shouldSync = isConnected && isInternetReachable;

    if (!shouldSync) {
      // Reset sync flag when disconnected
      hasSyncedRef.current = false;
      return;
    }

    // Skip if already synced or currently syncing
    if (hasSyncedRef.current || isSyncingRef.current) {
      return;
    }

    // Sync queue when connection is restored
    const syncQueue = async () => {
      isSyncingRef.current = true;
      try {
        const queueSize = await offlineQueueService.getQueueSize();
        if (queueSize > 0) {
          console.log(`[OfflineQueueSync] Syncing ${queueSize} queued items...`);
          const result = await offlineQueueService.syncQueue();
          console.log(
            `[OfflineQueueSync] Sync complete: ${result.success} succeeded, ${result.failed} failed`
          );
        }
        hasSyncedRef.current = true;
      } catch (error) {
        console.error('[OfflineQueueSync] Error syncing queue:', error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Small delay to ensure socket is fully connected
    const timeout = setTimeout(() => {
      syncQueue();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isConnected, isInternetReachable]);
};

