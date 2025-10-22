import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to auth group by default
  return <Redirect href="/(auth)/login" />;
}
