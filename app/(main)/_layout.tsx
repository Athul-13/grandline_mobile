import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function MainLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F1DE' }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Main App'
          }}
        />
      </Stack>
      <StatusBar style="dark" backgroundColor="#F4F1DE" />
    </View>
  );
}
