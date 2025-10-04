import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Helper function to check if we have a good internet connection
  const hasGoodConnection = () => {
    return isConnected && isInternetReachable && connectionType !== 'none';
  };

  // Helper function to get connection status message
  const getConnectionStatusMessage = () => {
    if (!isConnected) {
      return 'No internet connection detected';
    }
    if (!isInternetReachable) {
      return 'Connected to network but no internet access';
    }
    if (connectionType === 'cellular') {
      return 'Connected via mobile data';
    }
    if (connectionType === 'wifi') {
      return 'Connected via WiFi';
    }
    return 'Connection status unknown';
  };

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    hasGoodConnection,
    getConnectionStatusMessage,
  };
};
