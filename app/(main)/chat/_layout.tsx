import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="chat-list"
        options={{
          headerShown: true,
          title: 'Chats',
        }}
      />
      <Stack.Screen
        name="chat-detail"
        options={{
          headerShown: false,
          title: 'Chat',
        }}
      />
    </Stack>
  );
}

