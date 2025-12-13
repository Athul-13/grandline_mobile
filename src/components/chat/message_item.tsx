/**
 * Message Item Component
 * Displays a single message bubble
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const getDeliveryStatusIcon = () => {
    switch (message.deliveryStatus) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.content,
            isOwnMessage ? styles.ownContent : styles.otherContent,
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isOwnMessage && (
            <Text
              style={[
                styles.status,
                message.deliveryStatus === 'read'
                  ? styles.statusRead
                  : message.deliveryStatus === 'delivered'
                  ? styles.statusDelivered
                  : styles.statusSent,
              ]}
            >
              {getDeliveryStatusIcon()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownContent: {
    color: '#fff',
  },
  otherContent: {
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  status: {
    fontSize: 12,
  },
  statusSent: {
    color: '#999',
  },
  statusDelivered: {
    color: '#999',
  },
  statusRead: {
    color: '#007AFF',
  },
});

