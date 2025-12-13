import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { chatService } from '../../services/api/chat_service';
import { notificationService } from '../../services/api/notification_service';
import { chatStorage } from '../../services/storage/chat_storage';
import { notificationStorage } from '../../services/storage/notification_storage';

/**
 * Test API Screen
 * Minimal UI to test API calls and storage functionality
 * This is a temporary screen for Phase 1 testing
 */
export const TestApiScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<string>('');

  const logResult = (message: string) => {
    setResults((prev) => `${prev}\n${new Date().toLocaleTimeString()}: ${message}`);
  };

  const showError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    logResult(`ERROR: ${message}`);
    Alert.alert('Error', message);
  };

  // Notification API Tests
  const testGetNotifications = async () => {
    setLoading('getNotifications');
    try {
      const response = await notificationService.getNotifications({ page: 1, limit: 10 });
      logResult(`✅ Get Notifications: ${response.notifications.length} notifications, ${response.unreadCount} unread`);
      // Save to storage
      await notificationStorage.saveNotifications(response.notifications);
      await notificationStorage.saveUnreadCount(response.unreadCount);
      logResult(`✅ Saved to storage`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  const testGetUnreadCount = async () => {
    setLoading('getUnreadCount');
    try {
      const response = await notificationService.getUnreadCount();
      logResult(`✅ Unread Count: ${response.unreadCount}`);
      await notificationStorage.saveUnreadCount(response.unreadCount);
      logResult(`✅ Saved to storage`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  const testMarkAsRead = async () => {
    setLoading('markAsRead');
    try {
      const notifications = await notificationStorage.getNotifications();
      if (notifications.length === 0) {
        Alert.alert('Info', 'No notifications to mark as read. Fetch notifications first.');
        return;
      }
      const firstUnread = notifications.find((n) => !n.isRead);
      if (!firstUnread) {
        Alert.alert('Info', 'All notifications are already read.');
        return;
      }
      await notificationService.markNotificationAsRead(firstUnread.notificationId);
      await notificationStorage.markAsRead(firstUnread.notificationId);
      logResult(`✅ Marked notification ${firstUnread.notificationId} as read`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  // Chat API Tests
  const testGetChats = async () => {
    setLoading('getChats');
    try {
      const response = await chatService.getChats();
      logResult(`✅ Get Chats: ${response.chats.length} chats`);
      await chatStorage.saveChats(response.chats);
      logResult(`✅ Saved to storage`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  const testGetChatMessages = async () => {
    setLoading('getChatMessages');
    try {
      const chats = await chatStorage.getChats();
      if (chats.length === 0) {
        Alert.alert('Info', 'No chats available. Fetch chats first.');
        return;
      }
      const firstChat = chats[0];
      const response = await chatService.getChatMessages({ chatId: firstChat.chatId, page: 1, limit: 20 });
      logResult(`✅ Get Messages for chat ${firstChat.chatId}: ${response.messages.length} messages`);
      await chatStorage.saveMessages(firstChat.chatId, response.messages);
      logResult(`✅ Saved to storage`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  // Storage Tests
  const testStorageNotifications = async () => {
    setLoading('storageNotifications');
    try {
      const notifications = await notificationStorage.getNotifications();
      const unreadCount = await notificationStorage.getUnreadCount();
      logResult(`✅ Storage - Notifications: ${notifications.length}, Unread: ${unreadCount}`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  const testStorageChats = async () => {
    setLoading('storageChats');
    try {
      const chats = await chatStorage.getChats();
      logResult(`✅ Storage - Chats: ${chats.length}`);
      if (chats.length > 0) {
        const messages = await chatStorage.getMessages(chats[0].chatId);
        logResult(`✅ Storage - Messages for first chat: ${messages.length}`);
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  const clearResults = () => {
    setResults('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phase 1: API & Storage Test</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.navButton]}
        onPress={() => router.push('/(main)/(settings)/test-socket')}
      >
        <Text style={styles.buttonText}>→ Go to Phase 2: Socket Test</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.buttonContainer}>
        <Text style={styles.sectionTitle}>Notification API</Text>
        <TouchableOpacity
          style={[styles.button, loading === 'getNotifications' && styles.buttonDisabled]}
          onPress={testGetNotifications}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Get Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading === 'getUnreadCount' && styles.buttonDisabled]}
          onPress={testGetUnreadCount}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Get Unread Count</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading === 'markAsRead' && styles.buttonDisabled]}
          onPress={testMarkAsRead}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Mark First Unread as Read</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Chat API</Text>
        <TouchableOpacity
          style={[styles.button, loading === 'getChats' && styles.buttonDisabled]}
          onPress={testGetChats}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Get Chats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading === 'getChatMessages' && styles.buttonDisabled]}
          onPress={testGetChatMessages}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Get Messages (First Chat)</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Storage</Text>
        <TouchableOpacity
          style={[styles.button, loading === 'storageNotifications' && styles.buttonDisabled]}
          onPress={testStorageNotifications}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Test Notification Storage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading === 'storageChats' && styles.buttonDisabled]}
          onPress={testStorageChats}
          disabled={!!loading}
        >
          <Text style={styles.buttonText}>Test Chat Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Results:</Text>
        <ScrollView style={styles.results}>
          <Text style={styles.resultsText}>{results || 'No results yet...'}</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    marginTop: 16,
  },
  navButton: {
    backgroundColor: '#9C27B0',
    marginBottom: 16,
  },
  resultsContainer: {
    height: 200,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  results: {
    flex: 1,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

