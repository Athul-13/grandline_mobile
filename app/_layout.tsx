import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { queryClient } from '../src/config/query_client';
import { store } from '../src/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
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
