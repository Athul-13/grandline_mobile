/**
 * Network Status Hook
 * Monitors network connectivity and provides status information
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/**
 * Network status type
 */
export type NetworkStatus = 'unknown' | 'connected' | 'disconnected';

/**
 * Network status hook
 * Returns current network status and connection information
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  /**
   * Update network state
   */
  const updateNetworkState = useCallback((state: NetInfoState) => {
    setNetworkState(state);
    setIsConnected(state.isConnected ?? false);
    setIsInternetReachable(state.isInternetReachable ?? false);
  }, []);

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(updateNetworkState);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    return () => {
      unsubscribe();
    };
  }, [updateNetworkState]);

  const status: NetworkStatus = isConnected === null ? 'unknown' : isConnected ? 'connected' : 'disconnected';

  return {
    status,
    isConnected: isConnected ?? false,
    isInternetReachable: isInternetReachable ?? false,
    networkState,
    type: networkState?.type,
  };
};

