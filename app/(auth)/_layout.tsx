import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F1DE' }}>
      <Stack>
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            title: 'Login'
          }} 
        />
        <Stack.Screen 
          name="password-change" 
          options={{ 
            headerShown: false,
            title: 'Change Password'
          }} 
        />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            title: 'Driver Onboarding'
          }} 
        />
      </Stack>
      <StatusBar style="dark" backgroundColor="#F4F1DE" />
    </View>
  );
}
