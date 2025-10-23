import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}
