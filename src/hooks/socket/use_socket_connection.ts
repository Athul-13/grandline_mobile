import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Socket } from 'socket.io-client';
import { SOCKET_RECONNECTION_DELAY, SOCKET_STATE_UPDATE_INTERVAL } from '../../constants/socket';
import {
    disconnectSocket,
    getSocketClient,
    getSocketConnectionState,
    type SocketConnectionState
} from '../../services/socket/socket_client';
import type { RootState } from '../../store/store';

/**
 * Hook to manage socket connection lifecycle
 * Automatically connects on mount if authenticated, disconnects on unmount
 * Provides connection state and manual connect/disconnect methods
 */
export const useSocketConnection = () => {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const [connectionState, setConnectionState] = useState<SocketConnectionState>('disconnected');
  const [socket, setSocket] = useState<Socket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Update connection state from socket client
   * 
   * @returns {void}
   */
  const updateConnectionState = useCallback(() => {
    const state = getSocketConnectionState();
    setConnectionState(state);
  }, []);

  /**
   * Connect to socket
   * 
   * Creates socket instance and establishes connection if authenticated.
   * Sets up event listeners for connection state updates.
   * 
   * @returns {void}
   */
  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      console.warn('[useSocketConnection] Cannot connect: user not authenticated');
      return;
    }

    const socketInstance = getSocketClient();
    if (!socketInstance) {
      console.error('[useSocketConnection] Failed to get socket client');
      return;
    }

    setSocket(socketInstance);
    updateConnectionState();

    // Connect if not already connected
    if (!socketInstance.connected) {
      console.log('[useSocketConnection] Connecting socket...');
      socketInstance.connect();
    }

    // Set up state update listeners
    socketInstance.on('connect', () => {
      console.log('[useSocketConnection] Socket connected');
      updateConnectionState();
    });

    socketInstance.on('disconnect', () => {
      console.log('[useSocketConnection] Socket disconnected');
      updateConnectionState();
    });

    socketInstance.on('connect_error', () => {
      console.error('[useSocketConnection] Socket connection error');
      updateConnectionState();
    });
  }, [isAuthenticated, accessToken, updateConnectionState]);

  /**
   * Disconnect from socket
   * 
   * Cleans up socket connection and clears any pending reconnection attempts.
   * 
   * @returns {void}
   */
  const disconnect = useCallback(() => {
    console.log('[useSocketConnection] Disconnecting socket...');
    disconnectSocket();
    setSocket(null);
    setConnectionState('disconnected');

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Reconnect to socket
   * 
   * Disconnects current socket and reconnects after a short delay.
   * 
   * @returns {void}
   */
  const reconnect = useCallback(() => {
    disconnect();
    // Small delay before reconnecting
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, SOCKET_RECONNECTION_DELAY);
  }, [connect, disconnect]);

  // Auto-connect on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      // Disconnect if not authenticated
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  // Monitor network changes and reconnect if needed
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        // Network is available, ensure socket is connected
        const socketInstance = getSocketClient();
        if (socketInstance && !socketInstance.connected) {
          console.log('[useSocketConnection] Network reconnected, reconnecting socket...');
          connect();
        }
      } else {
        // Network is unavailable
        console.log('[useSocketConnection] Network unavailable');
        updateConnectionState();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, accessToken, connect, updateConnectionState]);

  // Update connection state periodically
  useEffect(() => {
    if (!socket) {
      return;
    }

    const interval = setInterval(() => {
      updateConnectionState();
    }, SOCKET_STATE_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [socket, updateConnectionState]);

  return {
    socket,
    connectionState,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    reconnect,
  };
};

