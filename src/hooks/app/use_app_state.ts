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
  appState: AppStateStatus;
  isActive: boolean;
  isBackground: boolean;
  isInactive: boolean;
}

/**
 * Hook to track app state (foreground/background)
 * Returns current app state and helper booleans
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

