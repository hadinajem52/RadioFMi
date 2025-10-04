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
import { openORBForStation } from '../utils/webViewFallback';
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
        
        setErrorCallback(async (error) => {
          console.error('Stream error callback:', error);
          setStreamError(error);
          setIsLoading(false);
          
          // Get current track info from TrackPlayer
          let trackInfo = null;
          try {
            const trackIndex = await TrackPlayer.getCurrentTrack();
            if (trackIndex !== null && trackIndex !== undefined) {
              trackInfo = await TrackPlayer.getTrack(trackIndex);
            }
          } catch (e) {
            console.log('Could not get current track:', e);
          }
          
          // Check network status when error occurs
          const networkStatus = getConnectionStatusMessage();
          console.log('Network status during error:', networkStatus);
          console.log('Track info during error:', trackInfo);
          
          // Show user-friendly error message based on error type and network status
          if (error.message.includes('timeout')) {
            // Find the original station object from radioStations array
            let station = currentStation;
            if (!station && trackInfo) {
              // TrackPlayer stores IDs as strings, so we need to parse
              const trackId = typeof trackInfo.id === 'string' ? parseInt(trackInfo.id, 10) : trackInfo.id;
              station = radioStations.find(s => s.id === trackId) || trackInfo;
            }
            
            const buttons = [
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
            ];
            if (station) {
              buttons.push({ text: 'Open Web Player', onPress: () => openORBForStation(station) });
            }
            Alert.alert(
              'Connection Timeout', 
              !hasGoodConnection() 
                ? `${networkStatus}. Please check your connection and try again.`
                : 'Unable to connect to the radio station within the timeout period. The station may be experiencing issues or your connection may be slow.',
              buttons
            );
          } else if (/source error/i.test(error.message)) {
            // Find the original station object from radioStations array
            let station = currentStation;
            
            if (!station && trackInfo) {
              // Try to find station by ID from trackInfo
              // TrackPlayer stores IDs as strings, so we need to parse
              const trackId = typeof trackInfo.id === 'string' ? parseInt(trackInfo.id, 10) : trackInfo.id;
              station = radioStations.find(s => s.id === trackId);
              console.log('TrackInfo ID:', trackInfo.id, 'Parsed ID:', trackId);
              console.log('Found station from radioStations by ID:', station?.name);
              console.log('Station webViewFallbackUrl:', station?.webViewFallbackUrl);
            }
            
            if (!station && trackInfo) {
              // Fallback: use trackInfo directly
              station = trackInfo;
              console.log('Using trackInfo as fallback (no match found in radioStations)');
            }
            
            if (station) {
              // Automatically open webview immediately without alert
              setStreamError(null);
              console.log('Opening webview automatically for:', station.name || station.title);
              console.log('Final station has webViewFallbackUrl:', !!station.webViewFallbackUrl);
              setTimeout(() => openORBForStation(station), 100);
            } else {
              // Fallback if no station info available
              console.error('No station info available for webview fallback');
              Alert.alert(
                'Station Unavailable',
                'This station seems offline or blocking in-app playback.',
                [{ text: 'OK', onPress: () => setStreamError(null) }]
              );
            }
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
            const buttons = [ { text: 'OK', onPress: () => setStreamError(null) } ];
            if (currentStation) {
              buttons.push({ text: 'Open Web Player', onPress: () => openORBForStation(currentStation) });
            }
            Alert.alert(
              'Stream Error', 
              error.message || 'Unable to play this radio station. The station may be temporarily unavailable.',
              buttons
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

    };
  }, []);

  // Update player volume when volume state changes
  useEffect(() => {
    const updateVolume = async () => {
      try {
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
        errorMessage = 'This station seems offline or blocking in-app playback. Opening Web Player automatically...';
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
      
      // Handle source errors by opening webview immediately
      if (/source error/i.test(error.message)) {
        if (station) {
          // Automatically open webview immediately without alert
          console.log('Opening webview automatically for:', station.name);
          setTimeout(() => openORBForStation(station), 100);
          return; // Skip alert
        }
      }
      
      // For all other errors, show alert with appropriate buttons
      let buttons = [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: () => {
            // Add a small delay before retrying
            setTimeout(() => playStation(station), 1000);
          }
        }
      ];
      
      // Add web fallback for other non-network failures
      if (!isNetworkError && !(/source error/i.test(error.message))) {
        buttons.push({ text: 'Open Web Player', onPress: () => openORBForStation(station) });
      }

      Alert.alert(errorTitle, errorMessage, buttons);
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