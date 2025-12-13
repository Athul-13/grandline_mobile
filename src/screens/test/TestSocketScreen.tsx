import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSocketConnection } from '../../hooks/socket/use_socket_connection';
import type { RootState } from '../../store/store';

/**
 * Test Socket Screen
 * Minimal UI to test socket connection functionality
 * This is a temporary screen for Phase 2 testing
 */
export const TestSocketScreen: React.FC = () => {
  const { socket, connectionState, isConnected, connect, disconnect, reconnect } = useSocketConnection();
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const [events, setEvents] = useState<string[]>([]);
  const [eventCount, setEventCount] = useState(0);

  const logEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [`${timestamp}: ${message}`, ...prev].slice(0, 50)); // Keep last 50 events
    setEventCount((prev) => prev + 1);
  };

  // Listen to socket events
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onConnect = () => {
      logEvent('✅ Socket connected');
    };

    const onDisconnect = (reason: string) => {
      logEvent(`❌ Socket disconnected: ${reason}`);
    };

    const onConnectError = (error: Error) => {
      logEvent(`⚠️ Connection error: ${error.message}`);
    };

    const onReconnect = (attemptNumber: number) => {
      logEvent(`🔄 Reconnected after ${attemptNumber} attempts`);
    };

    const onReconnectAttempt = (attemptNumber: number) => {
      logEvent(`🔄 Reconnection attempt ${attemptNumber}`);
    };

    const onReconnectError = (error: Error) => {
      logEvent(`⚠️ Reconnection error: ${error.message}`);
    };

    const onReconnectFailed = () => {
      logEvent('❌ Reconnection failed');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect_error', onReconnectError);
    socket.on('reconnect_failed', onReconnectFailed);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('reconnect_error', onReconnectError);
      socket.off('reconnect_failed', onReconnectFailed);
    };
  }, [socket]);

  // Log connection state changes
  useEffect(() => {
    logEvent(`Connection state: ${connectionState}`);
  }, [connectionState]);

  const handleConnect = () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be logged in to connect to socket');
      return;
    }
    logEvent('🔌 Attempting to connect...');
    connect();
  };

  const handleDisconnect = () => {
    logEvent('🔌 Disconnecting...');
    disconnect();
  };

  const handleReconnect = () => {
    logEvent('🔌 Reconnecting...');
    reconnect();
  };

  const clearEvents = () => {
    setEvents([]);
    setEventCount(0);
  };

  const getStateColor = () => {
    switch (connectionState) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phase 2: Socket Connection Test</Text>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStateColor() }]} />
        <Text style={styles.statusText}>
          Status: <Text style={styles.statusValue}>{connectionState.toUpperCase()}</Text>
        </Text>
      </View>

      {/* Auth Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.infoText}>
          Token: {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}
        </Text>
        <Text style={styles.infoText}>
          Socket ID: {socket?.id || 'N/A'}
        </Text>
        <Text style={styles.infoText}>
          Events: {eventCount}
        </Text>
      </View>

      {/* Control Buttons */}
      <ScrollView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.connectButton, !isAuthenticated && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={!isAuthenticated || isConnected}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.disconnectButton, !isConnected && styles.buttonDisabled]}
          onPress={handleDisconnect}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.reconnectButton, !isAuthenticated && styles.buttonDisabled]}
          onPress={handleReconnect}
          disabled={!isAuthenticated}
        >
          <Text style={styles.buttonText}>Reconnect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearEvents}>
          <Text style={styles.buttonText}>Clear Events</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Events Log */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>Events Log:</Text>
        <ScrollView style={styles.events}>
          {events.length === 0 ? (
            <Text style={styles.noEvents}>No events yet...</Text>
          ) : (
            events.map((event, index) => (
              <Text key={index} style={styles.eventText}>
                {event}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  reconnectButton: {
    backgroundColor: '#FF9800',
  },
  clearButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventsContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  events: {
    flex: 1,
  },
  eventText: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#333',
  },
  noEvents: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

