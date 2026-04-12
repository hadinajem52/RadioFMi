import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';
import radioStations from '../data/radioStations';
import {
  addTrack,
  pauseTrack,
  playTrack,
  setErrorCallback,
  setStreamStatusCallback,
  setupPlayer,
  stopTrack,
} from '../services/TrackPlayerService';
import StreamUrlCache from '../services/StreamUrlCache';
import { testInternetConnectivity } from '../utils/networkUtils';
import { PLAYBACK_STATUS } from '../utils/playbackStatus';
import { openORBForStation } from '../utils/webViewFallback';
import { useNetworkStatus } from './useNetworkStatus';

const stationById = new Map(radioStations.map((station) => [station.id, station]));

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

export const usePlayer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(PLAYBACK_STATUS.IDLE);

  const playbackState = usePlaybackState();
  const { hasGoodConnection, getConnectionStatusMessage, isConnected, isInternetReachable } = useNetworkStatus();
  const currentStationRef = useRef(null);
  const networkStateRef = useRef({
    hasGoodConnection,
    getConnectionStatusMessage,
    isConnected,
    isInternetReachable,
  });
  const playbackAttemptTokenRef = useRef(0);
  const handledSourceFallbackStationIdRef = useRef(null);

  const isPlaying = playbackState?.state === State.Playing;

  const bumpPlaybackAttemptToken = useCallback(() => {
    playbackAttemptTokenRef.current += 1;
    return playbackAttemptTokenRef.current;
  }, []);

  const isCurrentAttempt = useCallback(
    (attemptToken) => playbackAttemptTokenRef.current === attemptToken,
    []
  );

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

  useEffect(() => {
    return () => {
      bumpPlaybackAttemptToken();
    };
  }, [bumpPlaybackAttemptToken]);

  const getErrorMessage = useCallback((error) => error?.message || 'Unknown error', []);

  const isSourceErrorMessage = useCallback((message) => /source error/i.test(message), []);

  const isNetworkErrorMessage = useCallback(
    (message) =>
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('ENOTFOUND') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT') ||
      message.includes('Internet connectivity test failed') ||
      !networkStateRef.current.hasGoodConnection(),
    []
  );

  const getCurrentConnectionStatusMessage = useCallback(
    () => networkStateRef.current.getConnectionStatusMessage(),
    []
  );

  const getStationFromTrackInfo = useCallback((trackInfo, fallbackStation = currentStationRef.current) => {
    if (fallbackStation) {
      return fallbackStation;
    }
    if (!trackInfo) {
      return null;
    }
    const trackId = typeof trackInfo.id === 'string' ? parseInt(trackInfo.id, 10) : trackInfo.id;
    return stationById.get(trackId) || trackInfo;
  }, []);

  const getCurrentTrackInfo = useCallback(async () => {
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
  }, []);

  const openWebPlayerFallback = useCallback((station) => {
    if (!station) {
      return;
    }
    setTimeout(() => openORBForStation(station), 100);
  }, []);

  const ensurePlayerReady = useCallback(async () => {
    if (isPlayerReady) {
      return true;
    }

    try {
      const isSetup = await setupPlayer();
      setIsPlayerReady(Boolean(isSetup));
      return Boolean(isSetup);
    } catch (error) {
      console.error('Error ensuring player readiness:', error);
      setIsPlayerReady(false);
      return false;
    }
  }, [isPlayerReady]);

  const getPlaybackErrorAlert = useCallback(
    (message) => {
      const { isConnected: hasNetworkConnection, isInternetReachable: canReachInternet } = networkStateRef.current;

      if (isNetworkErrorMessage(message)) {
        if (!hasNetworkConnection) {
          return {
            title: 'Connection Error',
            message: 'No internet connection. Please connect to WiFi or mobile data and try again.',
          };
        }

        if (canReachInternet === false) {
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
          message:
            'Unable to connect to the radio station. This may be due to a poor connection or the station may be temporarily unavailable.',
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
    },
    [isNetworkErrorMessage, isSourceErrorMessage]
  );

  const playStation = useCallback(
    async (station, options = {}) => {
      if (!isPlayerReady) {
        const didInitialize = await ensurePlayerReady();
        if (!didInitialize) {
          Alert.alert('Setup Error', 'Audio player is still initializing. Please try again.');
          return;
        }
      }

      handledSourceFallbackStationIdRef.current = null;
      const attemptToken = options.attemptToken ?? bumpPlaybackAttemptToken();
      const forceConnectivityProbe = options.forceConnectivityProbe === true;
      const allowFreshSourceRetry = options.allowFreshSourceRetry !== false;

      if (!isCurrentAttempt(attemptToken)) {
        return;
      }

      if (!hasGoodConnection()) {
        const statusMessage = getConnectionStatusMessage();
        Alert.alert('No Internet Connection', `${statusMessage}. Please check your internet connection and try again.`, [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => {
              playStation(station, { forceConnectivityProbe: true });
            },
          },
        ]);
        return;
      }

      try {
        setIsLoading(true);
        setCurrentStation(station);
        setConnectionStatus(PLAYBACK_STATUS.CONNECTING);

        if (forceConnectivityProbe || isInternetReachable === null) {
          const hasInternet = await testInternetConnectivity({ force: forceConnectivityProbe });
          if (!hasInternet && isCurrentAttempt(attemptToken)) {
            throw new Error('Internet connectivity test failed - no internet access detected');
          }
        }

        if (!isCurrentAttempt(attemptToken)) {
          return;
        }

        await stopTrack();

        if (!isCurrentAttempt(attemptToken)) {
          return;
        }

        const resolvedUrl = await StreamUrlCache.getUrl(station);
        const trackToPlay = resolvedUrl ? { ...station, url: resolvedUrl } : station;

        if (!isCurrentAttempt(attemptToken)) {
          return;
        }

        await addTrack(trackToPlay);
        await playTrack(trackToPlay);

        if (!isCurrentAttempt(attemptToken)) {
          return;
        }

        setIsLoading(false);
        setConnectionStatus(PLAYBACK_STATUS.PLAYING);
      } catch (error) {
        const message = getErrorMessage(error);
        console.error('Error playing station:', error);

        if (!isCurrentAttempt(attemptToken)) {
          return;
        }

        setIsLoading(false);
        setConnectionStatus(PLAYBACK_STATUS.ERROR);

        if (isSourceErrorMessage(message)) {
          if (allowFreshSourceRetry) {
            await StreamUrlCache.invalidate(station.id);
            const freshUrl = await StreamUrlCache.refetch(station);
            if (freshUrl) {
              await playStation(
                { ...station, url: freshUrl },
                { forceConnectivityProbe: true, allowFreshSourceRetry: false }
              );
              return;
            }
          }
          openWebPlayerFallback(station);
          return;
        }

        const errorAlert = getPlaybackErrorAlert(message);
        const buttons = [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => playStation(station, { forceConnectivityProbe: true }),
          },
        ];

        if (!isNetworkErrorMessage(message)) {
          buttons.push({ text: 'Open Web Player', onPress: () => openWebPlayerFallback(station) });
        }

        Alert.alert(errorAlert.title, errorAlert.message, buttons);
      }
    },
    [
      bumpPlaybackAttemptToken,
      ensurePlayerReady,
      getConnectionStatusMessage,
      getErrorMessage,
      getPlaybackErrorAlert,
      hasGoodConnection,
      isCurrentAttempt,
      isInternetReachable,
      isNetworkErrorMessage,
      isPlayerReady,
      isSourceErrorMessage,
      openWebPlayerFallback,
    ]
  );

  const togglePlayPause = useCallback(async () => {
    if (!currentStation) {
      return;
    }

    if (!isPlaying && !hasGoodConnection()) {
      const statusMessage = getConnectionStatusMessage();
      Alert.alert('No Internet Connection', `${statusMessage}. Cannot play radio without an internet connection.`, [
        { text: 'OK' },
        {
          text: 'Retry',
          onPress: () => playStation(currentStation, { forceConnectivityProbe: true }),
        },
      ]);
      return;
    }

    try {
      if (isPlaying) {
        await pauseTrack();
      } else {
        await playTrack(currentStation);
      }
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
              onPress: () => playStation(currentStation, { forceConnectivityProbe: true }),
            },
          ]
        );
      } else if (currentStation && !isPlaying) {
        playStation(currentStation, { forceConnectivityProbe: true });
      }
    }
  }, [
    currentStation,
    getConnectionStatusMessage,
    getErrorMessage,
    hasGoodConnection,
    isNetworkErrorMessage,
    isPlaying,
    playStation,
  ]);

  const playNextStation = useCallback(async () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex((station) => station.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    await playStation(radioStations[nextIndex]);
  }, [currentStation, playStation]);

  const playPreviousStation = useCallback(async () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex((station) => station.id === currentStation.id);
    const previousIndex = currentIndex === 0 ? radioStations.length - 1 : currentIndex - 1;
    await playStation(radioStations[previousIndex]);
  }, [currentStation, playStation]);

  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async () => {
      try {
        const isSetup = await setupPlayer();
        if (!isMounted) {
          return;
        }
        setIsPlayerReady(isSetup);

        setStreamStatusCallback((event) => {
          setConnectionStatus(normalizeConnectionState(event.state));
        });

        setErrorCallback(async (error) => {
          const message = getErrorMessage(error);
          setIsLoading(false);
          setConnectionStatus(PLAYBACK_STATUS.ERROR);

          const trackInfo = await getCurrentTrackInfo();
          const station = getStationFromTrackInfo(trackInfo);
          const networkStatus = getCurrentConnectionStatusMessage();

          if (message.includes('timeout')) {
            const buttons = [{ text: 'OK' }];
            if (station) {
              buttons.push({
                text: 'Retry',
                onPress: () => playStation(station, { forceConnectivityProbe: true }),
              });
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
            const fallbackStation = station || currentStationRef.current;
            if (!fallbackStation) {
              return;
            }

            if (handledSourceFallbackStationIdRef.current === fallbackStation.id) {
              return;
            }

            handledSourceFallbackStationIdRef.current = fallbackStation.id;
            bumpPlaybackAttemptToken();
            await stopTrack();
            openWebPlayerFallback(fallbackStation);
          } else if (!networkStateRef.current.hasGoodConnection()) {
            Alert.alert(
              'Network Error',
              `${networkStatus}. Radio streaming requires an active internet connection.`,
              [
                { text: 'OK' },
                {
                  text: 'Retry',
                  onPress: () =>
                    currentStationRef.current &&
                    playStation(currentStationRef.current, { forceConnectivityProbe: true }),
                },
              ]
            );
          } else {
            const buttons = [{ text: 'OK' }];
            if (currentStationRef.current) {
              buttons.push({
                text: 'Retry',
                onPress: () =>
                  currentStationRef.current &&
                  playStation(currentStationRef.current, { forceConnectivityProbe: true }),
              });
              buttons.push({
                text: 'Open Web Player',
                onPress: () => openWebPlayerFallback(currentStationRef.current),
              });
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
      isMounted = false;
      setStreamStatusCallback(null);
      setErrorCallback(null);
    };
  }, [
    getCurrentConnectionStatusMessage,
    getCurrentTrackInfo,
    getErrorMessage,
    getStationFromTrackInfo,
    isSourceErrorMessage,
    bumpPlaybackAttemptToken,
    openWebPlayerFallback,
    playStation,
  ]);

  return useMemo(
    () => ({
      isLoading,
      currentStation,
      isPlayerReady,
      connectionStatus,
      isPlaying,
      playbackState,
      isConnected,
      isInternetReachable,
      hasGoodConnection,
      getConnectionStatusMessage,
      playStation,
      togglePlayPause,
      playNextStation,
      playPreviousStation,
    }),
    [
      connectionStatus,
      currentStation,
      getConnectionStatusMessage,
      hasGoodConnection,
      isConnected,
      isInternetReachable,
      isLoading,
      isPlayerReady,
      isPlaying,
      playbackState,
      playNextStation,
      playPreviousStation,
      playStation,
      togglePlayPause,
    ]
  );
};
