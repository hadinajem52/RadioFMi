import { useCallback, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isInternetReachable, setIsInternetReachable] = useState(null);

  useEffect(() => {
    const updateNetworkState = (state) => {
      setIsConnected(Boolean(state.isConnected));
      setConnectionType(state.type || 'unknown');
      setIsInternetReachable(state.isInternetReachable ?? null);
    };

    const unsubscribe = NetInfo.addEventListener(updateNetworkState);
    NetInfo.fetch().then(updateNetworkState);

    return () => unsubscribe();
  }, []);

  const hasGoodConnection = useCallback(() => {
    if (!isConnected || connectionType === 'none') {
      return false;
    }

    // Unknown reachability should not block playback upfront.
    if (isInternetReachable === null || isInternetReachable === undefined) {
      return true;
    }

    return Boolean(isInternetReachable);
  }, [connectionType, isConnected, isInternetReachable]);

  const getConnectionStatusMessage = useCallback(() => {
    if (!isConnected) {
      return 'No internet connection detected';
    }
    if (isInternetReachable === false) {
      return 'Connected to network but no internet access';
    }
    if (connectionType === 'cellular') {
      return 'Connected via mobile data';
    }
    if (connectionType === 'wifi') {
      return 'Connected via WiFi';
    }
    return 'Connection status unknown';
  }, [connectionType, isConnected, isInternetReachable]);

  return useMemo(
    () => ({
      isConnected,
      connectionType,
      isInternetReachable,
      hasGoodConnection,
      getConnectionStatusMessage,
    }),
    [
      connectionType,
      getConnectionStatusMessage,
      hasGoodConnection,
      isConnected,
      isInternetReachable,
    ]
  );
};
