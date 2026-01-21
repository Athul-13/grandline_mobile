import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Dashboard'
        }}
      />
      <Stack.Screen
        name="trip-detail"
        options={{
          headerShown: false,
          title: 'Trip Details'
        }}
      />
      <Stack.Screen
        name="trip-map"
        options={{
          headerShown: false,
          title: 'Trip Route'
        }}
      />
    </Stack>
  );
}
