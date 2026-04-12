import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import { 
  setupPlayer, 
  addTrack, 
  playTrack, 
  pauseTrack, 
  stopTrack,
  setStreamStatusCallback,
  setErrorCallback,
} from '../services/TrackPlayerService';
import { useNetworkStatus } from './useNetworkStatus';
import { openORBForStation } from '../utils/webViewFallback';
import StreamUrlCache from '../services/StreamUrlCache';
import { testInternetConnectivity } from '../utils/networkUtils';
import { PLAYBACK_STATUS } from '../utils/playbackStatus';
import radioStations from '../data/radioStations';

export const usePlayer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(PLAYBACK_STATUS.IDLE);

  const playbackState = usePlaybackState();
  const { hasGoodConnection, getConnectionStatusMessage, isConnected, isInternetReachable } = useNetworkStatus();
  const isRetrying = useRef(false);
  const currentStationRef = useRef(null);
  const networkStateRef = useRef({
    hasGoodConnection,
    getConnectionStatusMessage,
    isConnected,
    isInternetReachable,
  });

  const normalizeConnectionState = (state) => {
    switch (state) {
      case State.Playing:
        return PLAYBACK_STATUS.PLAYING;
      case State.Buffering:
        return PLAYBACK_STATUS.BUFFERING;
      case State.Paused:
        return PLAYBACK_STATUS.PAUSED;
      case State.Stopped:
        return PLAYBACK_STATUS.STOPPED;
      case State.Ready:
        return PLAYBACK_STATUS.READY;
      case State.Error:
        return PLAYBACK_STATUS.ERROR;
      default:
        return typeof state === 'string' ? state : PLAYBACK_STATUS.IDLE;
    }
  };

  // Derive isPlaying from playbackState
  const isPlaying = playbackState?.state === State.Playing;

  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  useEffect(() => {
    networkStateRef.current = {
      hasGoodConnection,
      getConnectionStatusMessage,
      isConnected,
      isInternetReachable,
    };
  }, [hasGoodConnection, getConnectionStatusMessage, isConnected, isInternetReachable]);

  const getErrorMessage = (error) => error?.message || 'Unknown error';

  const isSourceErrorMessage = (message) => /source error/i.test(message);

  const isNetworkErrorMessage = (message) => (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('Internet connectivity test failed') ||
    !networkStateRef.current.hasGoodConnection()
  );

  const getCurrentConnectionStatusMessage = () => networkStateRef.current.getConnectionStatusMessage();

  const getStationFromTrackInfo = (trackInfo, fallbackStation = currentStationRef.current) => {
    if (fallbackStation) {
      return fallbackStation;
    }

    if (!trackInfo) {
      return null;
    }

    const trackId = typeof trackInfo.id === 'string' ? parseInt(trackInfo.id, 10) : trackInfo.id;
    return radioStations.find((station) => station.id === trackId) || trackInfo;
  };

  const getCurrentTrackInfo = async () => {
    try {
      const trackIndex = await TrackPlayer.getCurrentTrack();
      if (trackIndex === null || trackIndex === undefined) {
        return null;
      }

      return await TrackPlayer.getTrack(trackIndex);
    } catch (error) {
      console.log('Could not get current track:', error);
      return null;
    }
  };

  const retryStationPlayback = (station, delay = 1000) => {
    if (!station) {
      return;
    }

    setTimeout(() => playStation(station), delay);
  };

  const openWebPlayerFallback = (station) => {
    if (!station) {
      return;
    }

    console.log('Opening webview automatically for:', station.name || station.title);
    setTimeout(() => openORBForStation(station), 100);
  };

  const retryWithFreshStreamUrl = async (station) => {
    if (!station || isRetrying.current) {
      return false;
    }

    isRetrying.current = true;
    let retryScheduled = false;

    try {
      const freshUrl = await StreamUrlCache.refetch(station);
      if (!freshUrl) {
        return false;
      }

      console.log('StreamUrlCache: retrying with fresh URL for', station.name);
      retryScheduled = true;
      setTimeout(async () => {
        try {
          await playStation({ ...station, url: freshUrl });
        } finally {
          isRetrying.current = false;
        }
      }, 300);
      return true;
    } catch (error) {
      console.error('Error fetching fresh stream URL:', error);
      return false;
    } finally {
      if (!retryScheduled) {
        isRetrying.current = false;
      }
    }
  };

  const handleSourceErrorRecovery = async (station, { retryFreshUrl = false } = {}) => {
    if (!station) {
      console.error('No station info available for webview fallback');
      Alert.alert(
        'Station Unavailable',
        'This station seems offline or blocking in-app playback.',
        [{ text: 'OK' }]
      );
      return true;
    }

    if (retryFreshUrl) {
      await StreamUrlCache.invalidate(station.id);
      if (await retryWithFreshStreamUrl(station)) {
        return true;
      }
    }

    console.log('Final station has webViewFallbackUrl:', !!station.webViewFallbackUrl);
    openWebPlayerFallback(station);
    return true;
  };

  const getPlaybackErrorAlert = (message) => {
    const { isConnected: hasNetworkConnection, isInternetReachable: canReachInternet } = networkStateRef.current;

    if (isNetworkErrorMessage(message)) {
      if (!hasNetworkConnection) {
        return {
          title: 'Connection Error',
          message: 'No internet connection. Please connect to WiFi or mobile data and try again.',
        };
      }

      if (!canReachInternet) {
        return {
          title: 'Connection Error',
          message: 'Connected to network but no internet access. Please check your connection.',
        };
      }

      if (message.includes('Internet connectivity test failed')) {
        return {
          title: 'Connection Error',
          message: 'Unable to reach the internet. Please check your connection and try again.',
        };
      }

      return {
        title: 'Connection Error',
        message: 'Unable to connect to the radio station. This may be due to a poor connection or the station may be temporarily unavailable.',
      };
    }

    if (isSourceErrorMessage(message)) {
      return {
        title: 'Station Unavailable',
        message: 'This station seems offline or blocking in-app playback. Opening Web Player automatically...',
      };
    }

    if (message.includes('Invalid stream URL')) {
      return {
        title: 'Station Error',
        message: 'This radio station is currently unavailable or the stream URL is invalid.',
      };
    }

    if (message.includes('format') || message.includes('codec')) {
      return {
        title: 'Format Error',
        message: 'This radio station uses an unsupported audio format.',
      };
    }

    if (message.includes('permission')) {
      return {
        title: 'Permission Error',
        message: 'Unable to access audio playback. Please check app permissions.',
      };
    }

    return {
      title: 'Playback Error',
      message: 'Failed to play radio station',
    };
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
          setConnectionStatus(normalizeConnectionState(event.state));
        });
        
        setErrorCallback(async (error) => {
          const message = getErrorMessage(error);
          console.error('Stream error callback:', error);
          setIsLoading(false);
          setConnectionStatus(PLAYBACK_STATUS.ERROR);
 
          const trackInfo = await getCurrentTrackInfo();
          const station = getStationFromTrackInfo(trackInfo);
          
          // Check network status when error occurs
          const networkStatus = getCurrentConnectionStatusMessage();
          console.log('Network status during error:', networkStatus);
          console.log('Track info during error:', trackInfo);
          
          // Show user-friendly error message based on error type and network status
          if (message.includes('timeout')) {
            const buttons = [
              { text: 'OK' },
              { text: 'Retry', onPress: () => retryStationPlayback(currentStationRef.current, 2000) }
            ];
            if (station) {
              buttons.push({ text: 'Open Web Player', onPress: () => openWebPlayerFallback(station) });
            }
            Alert.alert(
              'Connection Timeout', 
              !networkStateRef.current.hasGoodConnection() 
                ? `${networkStatus}. Please check your connection and try again.`
                : 'Unable to connect to the radio station within the timeout period. The station may be experiencing issues or your connection may be slow.',
              buttons
            );
          } else if (isSourceErrorMessage(message)) {
            await handleSourceErrorRecovery(station, { retryFreshUrl: true });
          } else if (!networkStateRef.current.hasGoodConnection()) {
            Alert.alert(
              'Network Error',
              `${networkStatus}. Radio streaming requires an active internet connection.`,
              [
                { text: 'OK' },
                { text: 'Retry', onPress: () => retryStationPlayback(currentStationRef.current) }
              ]
            );
          } else {
            const buttons = [{ text: 'OK' }];
            if (currentStationRef.current) {
              buttons.push({ text: 'Open Web Player', onPress: () => openWebPlayerFallback(currentStationRef.current) });
            }
            Alert.alert(
              'Stream Error',
              message || 'Unable to play this radio station. The station may be temporarily unavailable.',
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
      setStreamStatusCallback(null);
      setErrorCallback(null);
    };

  }, []);

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
      setConnectionStatus(PLAYBACK_STATUS.CONNECTING);
      
      // Additional connectivity tests for better error detection
      console.log('Testing internet connectivity...');
      const hasInternet = await testInternetConnectivity();
      
      if (!hasInternet) {
        throw new Error('Internet connectivity test failed - no internet access detected');
      }

      // Stop current playback and clear queue
      await stopTrack();

      // Resolve current stream URL from cache (falls back to station.url if no cache)
      const resolvedUrl = await StreamUrlCache.getUrl(station);
      const trackToPlay = resolvedUrl ? { ...station, url: resolvedUrl } : station;

      // Add the resolved station and play
      await addTrack(trackToPlay);
      await playTrack(trackToPlay);
      
      setIsLoading(false);
      setConnectionStatus(PLAYBACK_STATUS.PLAYING);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Error playing station:', error);
      setIsLoading(false);
      setConnectionStatus(PLAYBACK_STATUS.ERROR);

      if (isSourceErrorMessage(message)) {
        await handleSourceErrorRecovery(station);
        return;
      }

      const errorAlert = getPlaybackErrorAlert(message);
      const buttons = [
        { text: 'OK' },
        { text: 'Retry', onPress: () => retryStationPlayback(station) }
      ];
      
      // Add web fallback for other non-network failures
      if (!isNetworkErrorMessage(message)) {
        buttons.push({ text: 'Open Web Player', onPress: () => openWebPlayerFallback(station) });
      }

      Alert.alert(errorAlert.title, errorAlert.message, buttons);
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
        await playTrack(currentStation);
      }
      console.log('Action completed, new state:', await TrackPlayer.getState());
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Error toggling play/pause:', error);

      if (isNetworkErrorMessage(message)) {
        Alert.alert(
          'Connection Error',
          'Lost connection to the radio stream. Please check your internet connection.',
          [
            { text: 'OK' },
            {
              text: 'Retry',
              onPress: () => {
                if (currentStation) {
                  retryStationPlayback(currentStation, 0);
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
  };
};
