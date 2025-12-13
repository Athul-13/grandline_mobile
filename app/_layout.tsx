import { QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { queryClient } from '../src/config/query_client';
import { NotificationProvider } from '../src/contexts/notification_context';
import { ChatProvider } from '../src/contexts/chat_context';
import { OfflineIndicator } from '../src/components/common/offline_indicator';
import { useOfflineQueueSync } from '../src/hooks/network/use_offline_queue_sync';
import { useAuthRestoration } from '../src/hooks/auth';
import { store } from '../src/store';

function NavigationHandler() {
  const router = useRouter();
  const segments = useSegments();

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

  // Show loading screen during auth restoration
  if (isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5630C" />
        <StatusBar style="dark" backgroundColor="#F4F1DE" />
      </View>
    );
  }

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
        <StatusBar style="dark" backgroundColor="#F4F1DE" />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </Provider>
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
