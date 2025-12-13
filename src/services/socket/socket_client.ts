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
 * Connection state type
 */
export type SocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Get or create Socket.io client instance
 * Uses JWT from Redux store auth state
 * Authentication via auth.token (primary) and query.token (fallback)
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

  // Set up connection event listeners
  socketInstance.on('connect', () => {
    console.log('[SocketClient] Socket connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason: string) => {
    console.log('[SocketClient] Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (error: Error) => {
    console.error('[SocketClient] Socket connection error:', error.message);
  });

  socketInstance.on('reconnect', (attemptNumber: number) => {
    console.log('[SocketClient] Socket reconnected after', attemptNumber, 'attempts');
  });

  socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
    console.log('[SocketClient] Reconnection attempt:', attemptNumber);
  });

  socketInstance.on('reconnect_error', (error: Error) => {
    console.error('[SocketClient] Socket reconnection error:', error.message);
  });

  socketInstance.on('reconnect_failed', () => {
    console.error('[SocketClient] Socket reconnection failed');
  });

  return socketInstance;
};

/**
 * Disconnect Socket.io client
 * Properly cleans up all event listeners and disconnects the socket
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    console.log('[SocketClient] Disconnecting socket...');
    // Remove all event listeners to prevent memory leaks
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socketInstance?.connected ?? false;
};

/**
 * Get current socket instance (may be null)
 */
export const getSocketInstance = (): Socket | null => {
  return socketInstance;
};

/**
 * Get connection state
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

