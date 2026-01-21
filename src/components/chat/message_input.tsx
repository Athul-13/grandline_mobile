/**
 * Message Input Component
 * Input field with send button for sending messages
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { validateMessageContent } from '../../utils/chat_utils';
import { chatSocketService } from '../../services/socket/chat_socket_service';

interface MessageInputProps {
  chatId: string;
  onSend: (content: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  bottomInset?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  onSend,
  disabled = false,
  disabledMessage,
  bottomInset = 0,
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTimeRef = useRef<number>(0);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !disabled) {
      const now = Date.now();
      // Only send typing start if last typing was more than 2 seconds ago
      if (now - lastTypingTimeRef.current > 2000) {
        chatSocketService.startTyping(chatId);
        lastTypingTimeRef.current = now;
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        chatSocketService.stopTyping(chatId);
      }, 3000);
    } else {
      // Stop typing when message is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      chatSocketService.stopTyping(chatId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, chatId, disabled]);

  const handleSend = () => {
    if (!message.trim() || disabled) {
      return;
    }
    
    // Validate message
    const validation = validateMessageContent(message);
    if (!validation.valid) {
      setError(validation.error || 'Invalid message');
      return;
    }
    
    setError(null);
    
    // Stop typing indicator
    if (chatId) {
      chatSocketService.stopTyping(chatId);
    }
    
    try {
      onSend(message.trim());
      setMessage('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      Alert.alert('Error', errorMsg);
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        paddingBottom: Math.max(8, bottomInset),
        backgroundColor: theme.background,
        borderTopColor: theme.border,
      }
    ]}>
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.error + '10' }]}>
          <Ionicons name="alert-circle" size={16} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}

      {disabled && disabledMessage && (
        <View style={[styles.disabledBanner, { backgroundColor: theme.textSecondary + '10' }]}>
          <Ionicons name="information-circle" size={16} color={theme.textSecondary} />
          <Text style={[styles.disabledText, { color: theme.textSecondary }]}>{disabledMessage}</Text>
        </View>
      )}
      
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.card,
              borderColor: error ? theme.error : theme.border,
              color: theme.text,
            }
          ]}
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setError(null); // Clear error when typing
          }}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={5000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            { backgroundColor: theme.primary },
            (!message.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.xs,
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  disabledText: {
    flex: 1,
    fontSize: typography.sizes.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

