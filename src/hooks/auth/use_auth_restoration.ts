import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { restoreAuthState, setRestoring, refreshUserToken } from '../../store/slices/auth_slice';
import { authStorage } from '../../services/storage/auth_storage';

/**
 * Hook to restore authentication state on app startup
 * Loads tokens from secure storage and verifies/refreshes if needed
 */
export const useAuthRestoration = () => {
  const dispatch = useAppDispatch();
  const { isRestoring } = useAppSelector((state) => state.auth);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        dispatch(setRestoring(true));

        // Load auth data from secure storage
        const storedData = await authStorage.loadAuthData();

        // If no stored data, user is not logged in
        if (!storedData.accessToken || !storedData.refreshToken || !storedData.driver) {
          dispatch(setRestoring(false));
          setIsComplete(true);
          return;
        }

        // Restore auth state from storage
        dispatch(
          restoreAuthState({
            accessToken: storedData.accessToken,
            refreshToken: storedData.refreshToken,
            driver: storedData.driver,
          })
        );

        // Try to refresh token to verify it's still valid
        // This will update tokens if refresh succeeds, or clear auth if it fails
        try {
          await dispatch(refreshUserToken()).unwrap();
        } catch (error) {
          // Refresh failed - token is invalid, clear auth state
          console.warn('[useAuthRestoration] Token refresh failed, clearing auth state');
          dispatch(restoreAuthState({
            accessToken: null,
            refreshToken: null,
            driver: null,
          }));
        }

        dispatch(setRestoring(false));
        setIsComplete(true);
      } catch (error) {
        console.error('[useAuthRestoration] Error restoring auth:', error);
        dispatch(setRestoring(false));
        setIsComplete(true);
      }
    };

    if (!isComplete) {
      restoreAuth();
    }
  }, [dispatch, isComplete]);

  return {
    isRestoring,
    isComplete,
  };
};

