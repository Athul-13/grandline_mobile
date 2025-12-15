/**
 * Message Send Status Component
 * Shows sending/sent/delivered/read/failed status for messages
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { MessageDeliveryStatus } from '../../types/chat';

interface MessageSendStatusProps {
  status: MessageDeliveryStatus | 'sending' | 'failed';
  isOwnMessage: boolean;
}

export const MessageSendStatus: React.FC<MessageSendStatusProps> = ({
  status,
  isOwnMessage,
}) => {
  const { theme } = useTheme();
  
  if (!isOwnMessage) return null;
  
  if (status === 'sending') {
    return <ActivityIndicator size="small" color={theme.textSecondary} style={styles.indicator} />;
  }
  
  if (status === 'failed') {
    return (
      <Ionicons 
        name="alert-circle" 
        size={16} 
        color={theme.error} 
        style={styles.indicator}
      />
    );
  }
  
  // Delivery status icons
  const getDeliveryIcon = () => {
    switch (status) {
      case MessageDeliveryStatus.SENT:
        return '✓';
      case MessageDeliveryStatus.DELIVERED:
        return '✓✓';
      case MessageDeliveryStatus.READ:
        return '✓✓';
      default:
        return '';
    }
  };
  
  const getColor = () => {
    if (status === MessageDeliveryStatus.READ) {
      return theme.primary;
    }
    return theme.textSecondary;
  };
  
  return (
    <Text style={[styles.statusText, { color: getColor() }]}>
      {getDeliveryIcon()}
    </Text>
  );
};

const styles = StyleSheet.create({
  indicator: {
    marginLeft: 4,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    marginLeft: 4,
  },
});

