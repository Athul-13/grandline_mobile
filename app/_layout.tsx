import { QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { OfflineIndicator } from '../src/components/common/offline_indicator';
import { queryClient } from '../src/config/query_client';
import { ChatProvider } from '../src/contexts/chat_context';
import { NotificationProvider } from '../src/contexts/notification_context';
import { useAuthRestoration } from '../src/hooks/auth';
import { useOfflineQueueSync } from '../src/hooks/network/use_offline_queue_sync';
import { usePushNotifications } from '../src/hooks/push/use_push_notifications';
import { store } from '../src/store';

function NavigationHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      const { url } = event;
      handleDeepLink(url);
    });

    // Handle deep links when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      
      // Handle reset password deep link: grandlinemobile://reset-password?token=...
      if (parsed.path === 'reset-password' && parsed.queryParams?.token) {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { token: parsed.queryParams.token as string },
        });
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  return null;
}

function AppContent() {
  const { isRestoring } = useAuthRestoration();
  
  // Auto-sync offline queue when connection is restored
  useOfflineQueueSync();
  
  // Initialize push notifications
  usePushNotifications();

  return (
    <>
      <NavigationHandler />
      <View style={{ flex: 1, backgroundColor: '#F4F1DE' }}>
        <OfflineIndicator />
        <Stack>
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              title: 'Authentication'
            }} 
          />
          <Stack.Screen 
            name="(main)" 
            options={{ 
              headerShown: false,
              title: 'Main App'
            }} 
          />
        </Stack>
        
        {/* Show loading overlay while restoring auth */}
        {isRestoring && (
          <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
            <ActivityIndicator size="large" color="#C5630C" />
          </View>
        )}
        
        <StatusBar style="dark" backgroundColor="#F4F1DE" />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F1DE',
  },
});
