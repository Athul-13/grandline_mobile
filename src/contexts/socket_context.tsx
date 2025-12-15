/**
 * Socket Context
 * Centralized socket connection management for the entire app
 * Connects once on app start, stays connected until logout
 */

import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Socket } from 'socket.io-client';
import { SOCKET_RECONNECTION_DELAY, SOCKET_STATE_UPDATE_INTERVAL } from '../constants/socket';
import {
  getSocketClient,
  getSocketConnectionState,
  type SocketConnectionState,
} from '../services/socket/socket_client';
import type { RootState } from '../store/store';
import { store } from '../store/store';

/**
 * Socket context state interface
 */
interface SocketContextState {
  socket: Socket | null;
  connectionState: SocketConnectionState;
  isConnected: boolean;
  reconnect: () => void;
}

/**
 * Socket Context
 */
const SocketContext = createContext<SocketContextState | undefined>(undefined);

/**
 * Socket Provider Props
 */
interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * Socket Provider
 * Manages the singleton socket connection lifecycle
 * Only connects/disconnects based on authentication state
 * Never disconnects on component unmount
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const [connectionState, setConnectionState] = useState<SocketConnectionState>('disconnected');
  const [socket, setSocket] = useState<Socket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousTokenRef = useRef<string | null>(null);

  /**
   * Update connection state from socket client
   */
  const updateConnectionState = useCallback(() => {
    const state = getSocketConnectionState();
    setConnectionState(state);
  }, []);

  /**
   * Connect to socket
   * Creates socket instance and establishes connection if authenticated
   */
  const connect = useCallback(() => {
    // Get fresh auth state from store
    const state = store.getState();
    const { isAuthenticated: authStatus, accessToken: token } = state.auth;

    if (!authStatus || !token) {
      console.warn('[SocketProvider] Cannot connect: user not authenticated');
      return;
    }

    const socketInstance = getSocketClient();
    if (!socketInstance) {
      console.error('[SocketProvider] Failed to get socket client');
      return;
    }

    setSocket(socketInstance);
    updateConnectionState();

    // Connect if not already connected
    if (!socketInstance.connected) {
      console.log('[SocketProvider] Connecting socket...');
      socketInstance.connect();
    }

    // Update connection state immediately
    // Note: Event listeners are handled by socket_client.ts for logging
    // SocketProvider relies on periodic state updates (see useEffect below)
    updateConnectionState();

    // Store current token
    previousTokenRef.current = token;
  }, [updateConnectionState]);

  /**
   * Reconnect to socket
   * Useful for manual reconnection attempts
   */
  const reconnect = useCallback(() => {
    console.log('[SocketProvider] Manual reconnect requested');
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Get socket and reconnect
    const socketInstance = getSocketClient();
    if (socketInstance) {
      if (socketInstance.connected) {
        console.log('[SocketProvider] Socket already connected');
      } else {
        console.log('[SocketProvider] Reconnecting socket...');
        socketInstance.connect();
      }
      updateConnectionState();
    } else {
      // No socket instance, create new connection
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, SOCKET_RECONNECTION_DELAY);
    }
  }, [connect, updateConnectionState]);

  /**
   * Main effect: Connect when authenticated, disconnect when not
   * No cleanup on unmount - socket stays connected
   */
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Check if token changed
      if (previousTokenRef.current && previousTokenRef.current !== accessToken) {
        console.log('[SocketProvider] Token changed, reconnecting...');
        // Token changed, socket client will handle recreation
      }
      
      connect();
    } else {
      // User logged out - socket will be disconnected by logout handler
      console.log('[SocketProvider] User not authenticated, socket will disconnect');
      setSocket(null);
      setConnectionState('disconnected');
      previousTokenRef.current = null;
    }

    // IMPORTANT: No cleanup function here
    // Socket should stay connected until logout
  }, [isAuthenticated, accessToken, connect]);

  /**
   * Monitor network changes and reconnect if needed
   */
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        // Network is available, ensure socket is connected
        const socketInstance = getSocketClient();
        if (socketInstance && !socketInstance.connected) {
          console.log('[SocketProvider] Network reconnected, reconnecting socket...');
          reconnect();
        }
      } else {
        // Network is unavailable
        console.log('[SocketProvider] Network unavailable');
        updateConnectionState();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, accessToken, reconnect, updateConnectionState]);

  /**
   * Update connection state periodically
   */
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

  const value: SocketContextState = {
    socket,
    connectionState,
    isConnected: connectionState === 'connected',
    reconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

/**
 * Hook to use socket context
 * Must be used within SocketProvider
 */
export const useSocket = (): SocketContextState => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

