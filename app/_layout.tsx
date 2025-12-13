import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import * as Linking from 'expo-linking';
import { queryClient } from '../src/config/query_client';
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

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationHandler />
        <View style={{ flex: 1, backgroundColor: '#F4F1DE' }}>
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
      </QueryClientProvider>
    </Provider>
  );
}
