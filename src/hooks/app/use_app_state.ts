/**
 * App State Hook
 * Detects if app is in foreground or background
 */

import { useEffect, useState, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * App state hook return type
 */
export interface UseAppStateReturn {
  /** Current app state: 'active', 'background', or 'inactive' */
  appState: AppStateStatus;
  /** Whether app is in foreground (active) */
  isActive: boolean;
  /** Whether app is in background */
  isBackground: boolean;
  /** Whether app is transitioning (inactive) */
  isInactive: boolean;
}

/**
 * Hook to track app state (foreground/background)
 * 
 * Monitors React Native AppState to detect when app moves between
 * foreground and background. Useful for push notifications and
 * socket connection management.
 * 
 * @returns {UseAppStateReturn} App state information and helper booleans
 */
export const useAppState = (): UseAppStateReturn => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;
      setAppState(nextAppState);
      console.log('[AppState] State changed:', nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
  };
};

