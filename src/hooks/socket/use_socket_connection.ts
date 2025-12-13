import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Socket } from 'socket.io-client';
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update connection state
   */
  const updateConnectionState = useCallback(() => {
    const state = getSocketConnectionState();
    setConnectionState(state);
  }, []);

  /**
   * Connect to socket
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
   */
  const reconnect = useCallback(() => {
    disconnect();
    // Small delay before reconnecting
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  // Auto-connect on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  // Update connection state periodically
  useEffect(() => {
    if (!socket) {
      return;
    }

    const interval = setInterval(() => {
      updateConnectionState();
    }, 1000); // Update every second

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

