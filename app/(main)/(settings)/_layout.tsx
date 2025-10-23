import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Settings'
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          title: 'Profile'
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
          title: 'Notifications'
        }}
      />
      <Stack.Screen
        name="report-issue"
        options={{
          headerShown: false,
          title: 'Report Issue'
        }}
      />
    </Stack>
  );
}
