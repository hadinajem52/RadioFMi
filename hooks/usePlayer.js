import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import { 
  setupPlayer, 
  addTrack, 
  playTrack, 
  pauseTrack, 
  stopTrack,
  setVolume as setPlayerVolume,
  setStreamStatusCallback,
  setErrorCallback,
} from '../services/TrackPlayerService';
import { useNetworkStatus } from './useNetworkStatus';
import { testInternetConnectivity, testRadioStreamConnectivity } from '../utils/networkUtils';
import radioStations from '../data/radioStations';

export const usePlayer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [streamError, setStreamError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  
  const playbackState = usePlaybackState();
  const { hasGoodConnection, getConnectionStatusMessage, isConnected, isInternetReachable } = useNetworkStatus();

  // Derive isPlaying from playbackState
  const isPlaying = playbackState?.state === State.Playing;

  // Safe volume setter with validation
  const setSafeVolume = (newVolume) => {
    if (typeof newVolume === 'number' && !isNaN(newVolume) && newVolume >= 0 && newVolume <= 1) {
      setVolume(newVolume);
    } else {
      console.warn('Invalid volume value:', newVolume, 'keeping current volume:', volume);
    }
  };

  // Initialize TrackPlayer
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        // Initialize TrackPlayer
        const isSetup = await setupPlayer();
        setIsPlayerReady(isSetup);
        
        // Set up stream monitoring callbacks
        setStreamStatusCallback((event) => {
          console.log('Stream status update:', event);
          setConnectionStatus(event.state || 'unknown');
        });
        
        setErrorCallback((error) => {
          console.error('Stream error callback:', error);
          setStreamError(error);
          setIsLoading(false);
          
          // Check network status when error occurs
          const networkStatus = getConnectionStatusMessage();
          console.log('Network status during error:', networkStatus);
          
          // Show user-friendly error message based on error type and network status
          if (error.message.includes('timeout')) {
            Alert.alert(
              'Connection Timeout', 
              !hasGoodConnection() 
                ? `${networkStatus}. Please check your connection and try again.`
                : 'Unable to connect to the radio station within the timeout period. The station may be experiencing issues or your connection may be slow.',
              [
                { text: 'OK', onPress: () => setStreamError(null) },
                { 
                  text: 'Retry', 
                  onPress: () => {
                    if (currentStation) {
                      // Wait a moment before retrying
                      setTimeout(() => playStation(currentStation), 2000);
                    }
                  }
                }
              ]
            );
          } else if (/source error/i.test(error.message)) {
            Alert.alert(
              'Station Unavailable',
              'We reached the station but its audio source did not start streaming. This usually means the station is temporarily offline or blocking connections. You can retry or pick another station.',
              [
                { text: 'OK', onPress: () => setStreamError(null) },
                {
                  text: 'Retry',
                  onPress: () => {
                    if (currentStation) {
                      setTimeout(() => playStation(currentStation), 1500);
                    }
                  }
                }
              ]
            );
          } else if (!hasGoodConnection()) {
            Alert.alert(
              'Network Error', 
              `${networkStatus}. Radio streaming requires an active internet connection.`,
              [
                { text: 'OK', onPress: () => setStreamError(null) },
                { 
                  text: 'Retry', 
                  onPress: () => {
                    if (currentStation) {
                      setTimeout(() => playStation(currentStation), 1000);
                    }
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              'Stream Error', 
              error.message || 'Unable to play this radio station. The station may be temporarily unavailable.',
              [{ text: 'OK', onPress: () => setStreamError(null) }]
            );
          }
        });
        
      } catch (error) {
        console.error('Error setting up player:', error);
        Alert.alert('Setup Error', 'Failed to initialize audio player');
      }
    };

    initializePlayer();

    return () => {
      // Cleanup on unmount
      TrackPlayer.destroy();
    };
  }, []);

  // Update player volume when volume state changes
  useEffect(() => {
    const updateVolume = async () => {
      try {
        // Validate volume before setting
        if (typeof volume === 'number' && !isNaN(volume) && volume >= 0 && volume <= 1) {
          await setPlayerVolume(volume);
        } else {
          console.warn('Invalid volume value:', volume, 'skipping update');
        }
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    };
    
    if (isPlayerReady && volume !== undefined) {
      updateVolume();
    }
  }, [volume, isPlayerReady]);

  const playStation = async (station) => {
    if (!isPlayerReady) {
      Alert.alert('Error', 'Player is not ready yet');
      return;
    }

    // Check network connectivity before attempting to play
    if (!hasGoodConnection()) {
      const statusMessage = getConnectionStatusMessage();
      console.log('Network check failed:', statusMessage);
      
      Alert.alert(
        'No Internet Connection',
        `${statusMessage}. Please check your internet connection and try again.`,
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => {
              // Wait a moment and retry
              setTimeout(() => playStation(station), 1000);
            }
          }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      setCurrentStation(station);
      setStreamError(null);
      setConnectionStatus('connecting');
      
      // Additional connectivity tests for better error detection
      console.log('Testing internet connectivity...');
      const hasInternet = await testInternetConnectivity();
      
      if (!hasInternet) {
        throw new Error('Internet connectivity test failed - no internet access detected');
      }

      // Test if the specific radio stream is reachable
      if (station.url) {
        console.log('Testing radio stream connectivity...');
        const streamReachable = await testRadioStreamConnectivity(station.url, 8000);
        
        if (!streamReachable) {
          console.warn(`Radio stream ${station.url} appears to be unreachable`);
          // Don't throw error here, let TrackPlayer try - stream test might give false negatives
        }
      }
      
      // Stop current playback and clear queue
      await stopTrack();
      
      // Add the new station and play
      await addTrack(station);
      await playTrack();
      
      setIsLoading(false);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error playing station:', error);
      setIsLoading(false);
      setConnectionStatus('error');
      
      // Enhanced error handling with network-specific messages
      let errorMessage = 'Failed to play radio station';
      let errorTitle = 'Playback Error';
      
      // Check if it's a network-related error
      const isNetworkError = 
        error.message.includes('network') || 
        error.message.includes('timeout') || 
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('Internet connectivity test failed') ||
        !hasGoodConnection();
      
      if (isNetworkError) {
        errorTitle = 'Connection Error';
        if (!isConnected) {
          errorMessage = 'No internet connection. Please connect to WiFi or mobile data and try again.';
        } else if (!isInternetReachable) {
          errorMessage = 'Connected to network but no internet access. Please check your connection.';
        } else if (error.message.includes('Internet connectivity test failed')) {
          errorMessage = 'Unable to reach the internet. Please check your connection and try again.';
        } else {
          errorMessage = 'Unable to connect to the radio station. This may be due to a poor connection or the station may be temporarily unavailable.';
        }
      } else if (/source error/i.test(error.message)) {
        errorTitle = 'Station Unavailable';
        errorMessage = 'The station responded but its audio source did not start. It may be offline temporarily. Try again in a moment or choose another station.';
      } else if (error.message.includes('Invalid stream URL')) {
        errorTitle = 'Station Error';
        errorMessage = 'This radio station is currently unavailable or the stream URL is invalid.';
      } else if (error.message.includes('format') || error.message.includes('codec')) {
        errorTitle = 'Format Error';
        errorMessage = 'This radio station uses an unsupported audio format.';
      } else if (error.message.includes('permission')) {
        errorTitle = 'Permission Error';
        errorMessage = 'Unable to access audio playback. Please check app permissions.';
      }
      
      Alert.alert(errorTitle, errorMessage, [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: () => {
            // Add a small delay before retrying
            setTimeout(() => playStation(station), 1000);
          }
        }
      ]);
    }
  };

  const togglePlayPause = async () => {
    if (!currentStation) return;
    
    // If trying to play and there's no good connection, show network error
    if (!isPlaying && !hasGoodConnection()) {
      const statusMessage = getConnectionStatusMessage();
      Alert.alert(
        'No Internet Connection',
        `${statusMessage}. Cannot play radio without an internet connection.`,
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => {
              setTimeout(() => togglePlayPause(), 1000);
            }
          }
        ]
      );
      return;
    }
    
    console.log('Current playback state:', playbackState);
    console.log('isPlaying:', isPlaying);
    
    try {
      if (isPlaying) {
        console.log('Attempting to pause...');
        await pauseTrack();
      } else {
        console.log('Attempting to play...');
        await playTrack();
      }
      console.log('Action completed, new state:', await TrackPlayer.getState());
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      
      // Check if it's a network-related error
      const isNetworkError = 
        error.message.includes('network') || 
        error.message.includes('timeout') ||
        !hasGoodConnection();
      
      if (isNetworkError) {
        Alert.alert(
          'Connection Error',
          'Lost connection to the radio stream. Please check your internet connection.',
          [
            { text: 'OK' },
            {
              text: 'Retry',
              onPress: () => {
                if (currentStation) {
                  playStation(currentStation);
                }
              }
            }
          ]
        );
      } else {
        // If toggle fails, try to play the station again
        if (currentStation && !isPlaying) {
          playStation(currentStation);
        }
      }
    }
  };

  const playNextStation = async () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex(s => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    await playStation(radioStations[nextIndex]);
  };

  const playPreviousStation = async () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex(s => s.id === currentStation.id);
    const prevIndex = currentIndex === 0 ? radioStations.length - 1 : currentIndex - 1;
    await playStation(radioStations[prevIndex]);
  };

  return {
    // State
    isLoading,
    currentStation,
    isPlayerReady,
    volume,
    streamError,
    connectionStatus,
    isPlaying,
    playbackState,
    
    // Network status
    isConnected,
    isInternetReachable,
    hasGoodConnection,
    getConnectionStatusMessage,
    
    // Actions
    playStation,
    togglePlayPause,
    playNextStation,
    playPreviousStation,
    setSafeVolume,
  };
};