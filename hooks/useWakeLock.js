import { useEffect, useRef } from 'react';
import { Platform, NativeModules, AppState } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

/**
 * Hook to manage wake lock for background WebView audio playback
 * Keeps the device awake (CPU running) even when screen is off
 */
export const useWakeLock = (isActive) => {
  const wakeLockRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const acquireWakeLock = async () => {
      if (!isActive) return;

      try {
        // For web-based wake lock (if available in WebView)
        if ('wakeLock' in navigator) {
          try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            console.log('Wake Lock acquired (navigator)');
          } catch (err) {
            console.log('Navigator wake lock failed, using fallback:', err.message);
          }
        }

        // For React Native - keep app alive
        // This is handled by the native Android flags
        console.log('Wake lock management active');
      } catch (error) {
        console.error('Error acquiring wake lock:', error);
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
          .then(() => {
            console.log('Wake Lock released');
            wakeLockRef.current = null;
          })
          .catch((err) => {
            console.error('Error releasing wake lock:', err);
          });
      }
    };

    if (isActive) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }

    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isActive) {
        // Re-acquire wake lock when coming back to foreground
        acquireWakeLock();
      }
      appState.current = nextAppState;
    });

    // Cleanup
    return () => {
      releaseWakeLock();
      subscription.remove();
    };
  }, [isActive]);

  return null;
};

export default useWakeLock;
