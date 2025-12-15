/**
 * Socket.io Client
 * Main Socket.io connection setup with authentication for mobile app
 * Uses JWT token in auth object (primary) and query parameter (fallback)
 */

import { io, type Socket } from 'socket.io-client';
import { SOCKET_CONFIG } from '../../constants/api';
import { store } from '../../store/store';

/**
 * Socket.io Client Instance
 * Singleton instance for the application
 */
let socketInstance: Socket | null = null;

/**
 * Event listener references for cleanup
 */
let connectListener: (() => void) | null = null;
let disconnectListener: ((reason: string) => void) | null = null;
let connectErrorListener: ((error: Error) => void) | null = null;
let reconnectListener: ((attemptNumber: number) => void) | null = null;
let reconnectErrorListener: ((error: Error) => void) | null = null;
let reconnectFailedListener: (() => void) | null = null;

/**
 * Connection state type
 */
export type SocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Get or create Socket.io client instance
 * 
 * Uses JWT from Redux store auth state for authentication.
 * Authentication is done via auth.token (primary) and query.token (fallback).
 * Returns existing socket if already connected, or creates new one if needed.
 * 
 * @returns {Socket | null} Socket instance if authenticated, null otherwise
 */
export const getSocketClient = (): Socket | null => {
  // Get current auth state
  const state = store.getState();
  const { accessToken, isAuthenticated } = state.auth;

  // Don't create socket if not authenticated
  if (!isAuthenticated || !accessToken) {
    console.warn('[SocketClient] Cannot create socket: user not authenticated');
    return null;
  }

  // If socket exists and is connected, return it
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  // If socket exists but not connected, check if token changed
  if (socketInstance) {
    // If token changed, disconnect old socket and create new one
    const currentToken = (socketInstance.auth as { token?: string })?.token;
    if (currentToken !== accessToken) {
      console.log('[SocketClient] Token changed, reconnecting socket...');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    } else {
      // Token is same, return existing socket (will reconnect automatically)
      return socketInstance;
    }
  }

  // Create new socket instance
  console.log('[SocketClient] Creating new socket connection...');
  socketInstance = io(SOCKET_CONFIG.BASE_URL, {
    auth: {
      token: accessToken, // Primary authentication method
    },
    query: {
      token: accessToken, // Fallback authentication method
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
    reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
    reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX,
    timeout: SOCKET_CONFIG.TIMEOUT,
    autoConnect: false, // We'll connect manually via hook
  });

  // Set up connection event listeners and store references for cleanup
  connectListener = () => {
    if (__DEV__) {
      console.log('[SocketClient] Connected:', socketInstance?.id);
    }
  };
  socketInstance.on('connect', connectListener);

  disconnectListener = (reason: string) => {
    console.log('[SocketClient] Socket disconnected:', reason);
  };
  socketInstance.on('disconnect', disconnectListener);

  connectErrorListener = (error: Error) => {
    console.error('[SocketClient] Socket connection error:', error.message);
  };
  socketInstance.on('connect_error', connectErrorListener);

  reconnectListener = (attemptNumber: number) => {
    console.log('[SocketClient] Socket reconnected after', attemptNumber, 'attempts');
  };
  socketInstance.on('reconnect', reconnectListener);

  reconnectErrorListener = (error: Error) => {
    console.error('[SocketClient] Socket reconnection error:', error.message);
  };
  socketInstance.on('reconnect_error', reconnectErrorListener);

  reconnectFailedListener = () => {
    console.error('[SocketClient] Socket reconnection failed');
  };
  socketInstance.on('reconnect_failed', reconnectFailedListener);

  return socketInstance;
};

/**
 * Disconnect Socket.io client
 * 
 * Properly cleans up all event listeners and disconnects the socket.
 * This should be called when the user logs out or the app is closing.
 * 
 * @returns {void}
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    console.log('[SocketClient] Disconnecting socket...');
    
    // Remove event listeners explicitly to prevent memory leaks
    if (connectListener) {
      socketInstance.off('connect', connectListener);
      connectListener = null;
    }
    if (disconnectListener) {
      socketInstance.off('disconnect', disconnectListener);
      disconnectListener = null;
    }
    if (connectErrorListener) {
      socketInstance.off('connect_error', connectErrorListener);
      connectErrorListener = null;
    }
    if (reconnectListener) {
      socketInstance.off('reconnect', reconnectListener);
      reconnectListener = null;
    }
    if (reconnectErrorListener) {
      socketInstance.off('reconnect_error', reconnectErrorListener);
      reconnectErrorListener = null;
    }
    if (reconnectFailedListener) {
      socketInstance.off('reconnect_failed', reconnectFailedListener);
      reconnectFailedListener = null;
    }
    
    // Safety net: remove all remaining listeners
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Check if socket is currently connected
 * 
 * @returns {boolean} True if socket exists and is connected, false otherwise
 */
export const isSocketConnected = (): boolean => {
  return socketInstance?.connected ?? false;
};

/**
 * Get current socket instance
 * 
 * @returns {Socket | null} Current socket instance or null if not initialized
 */
export const getSocketInstance = (): Socket | null => {
  return socketInstance;
};

/**
 * Get current socket connection state
 * 
 * @returns {SocketConnectionState} Current connection state
 */
export const getSocketConnectionState = (): SocketConnectionState => {
  if (!socketInstance) {
    return 'disconnected';
  }
  if (socketInstance.connected) {
    return 'connected';
  }
  if (socketInstance.disconnected) {
    return 'disconnected';
  }
  return 'connecting';
};

