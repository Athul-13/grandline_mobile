import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/store/hooks';
import { selectIsAuthenticated, selectIsRestoring } from '../src/store/slices/auth_slice';

export default function Index() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isRestoring = useAppSelector(selectIsRestoring);

  // Wait for auth restoration to complete
  if (isRestoring) {
    return null; // Will be handled by root layout loading screen
  }

  // Redirect based on authentication state
  if (isAuthenticated) {
    return <Redirect href="/(main)/(dashboard)" />;
  }

  // Redirect to login if not authenticated
  return <Redirect href="/(auth)/login" />;
}
