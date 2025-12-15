/**
 * Offline Indicator Component
 * Displays a banner when the app is offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/network/use_network_status';

/**
 * Offline Indicator
 * Shows a banner at the top when offline
 */
export const OfflineIndicator: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  // Show indicator if not connected or internet not reachable
  if (isConnected && isInternetReachable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" style={styles.icon} />
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

