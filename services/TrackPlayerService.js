import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from 'react-native-track-player';
import { PLAYBACK_STATUS } from '../utils/playbackStatus';

let streamStatusCallback = null;
let errorCallback = null;
let connectionTimeoutId = null;
let bufferingTimeoutId = null;
let retryTimeoutId = null;
let listenersRegistered = false;
let activeRequestToken = 0;
let playerInitialized = false;
let playerSetupPromise = null;
let lastPlaybackErrorSignature = null;
let lastPlaybackErrorAt = 0;

const STREAM_CONFIG = {
  CONNECTION_TIMEOUT: 15000,
  BUFFERING_TIMEOUT: 45000,
  MAX_BUFFER_WINDOW_MS: 90000,
  MAX_PROBE_EXTENSIONS: 2,
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY_MS: 1200,
  RETRY_MAX_DELAY_MS: 6000,
  RETRY_JITTER_FACTOR: 0.25,
};

const nextRequestToken = () => {
  activeRequestToken += 1;
  return activeRequestToken;
};

const getRetryDelay = (attempt) => {
  const baseDelay = Math.min(
    STREAM_CONFIG.RETRY_MAX_DELAY_MS,
    STREAM_CONFIG.RETRY_BASE_DELAY_MS * Math.pow(2, Math.max(attempt - 1, 0))
  );
  const jitter = baseDelay * STREAM_CONFIG.RETRY_JITTER_FACTOR * Math.random();
  return Math.floor(baseDelay + jitter);
};

const clearStreamTimeouts = () => {
  if (connectionTimeoutId) {
    clearTimeout(connectionTimeoutId);
    connectionTimeoutId = null;
  }
  if (bufferingTimeoutId) {
    clearTimeout(bufferingTimeoutId);
    bufferingTimeoutId = null;
  }
  if (retryTimeoutId) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
};

const isValidStreamUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

function normalizeTrackToStation(track) {
  if (!track) {
    return null;
  }

  const stationId = typeof track.id === 'string' ? parseInt(track.id, 10) : track.id;
  return {
    id: stationId,
    name: track.title,
    url: track.url,
    description: track.description,
    image: track.artwork,
  };
}

async function getCurrentTrackStation() {
  try {
    const trackIndex = await TrackPlayer.getCurrentTrack();
    if (trackIndex === null || trackIndex === undefined) {
      return null;
    }

    const track = await TrackPlayer.getTrack(trackIndex);
    return normalizeTrackToStation(track);
  } catch {
    return null;
  }
}

const isRetryableError = (message) => /timeout|buffering/i.test(message);

async function checkBufferingStatus(station, retryCount = 0, meta = {}) {
  const {
    requestToken = activeRequestToken,
    startedAt = Date.now(),
    extensionCount = 0,
  } = meta;

  if (requestToken !== activeRequestToken) {
    return;
  }

  try {
    const maxChecks = 5;
    const checkDelayMs = 2000;

    for (let i = 0; i < maxChecks; i += 1) {
      if (!bufferingTimeoutId || requestToken !== activeRequestToken) {
        return;
      }

      const state = await TrackPlayer.getState();
      if (state !== State.Buffering) {
        clearStreamTimeouts();
        return;
      }

      if (i < maxChecks - 1) {
        await new Promise((resolve) => setTimeout(resolve, checkDelayMs));
      }
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed >= STREAM_CONFIG.MAX_BUFFER_WINDOW_MS) {
      if (streamStatusCallback) {
        streamStatusCallback({ state: PLAYBACK_STATUS.BUFFERING_FAILED, station });
      }
      handleStreamError('Buffering timeout - max buffering window reached', station, retryCount, requestToken);
      return;
    }

    let probeResponseOk = false;
    let probeTimeoutId = null;
    try {
      if (station?.url) {
        const controller = new AbortController();
        probeTimeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(station.url, { method: 'HEAD', signal: controller.signal });
        probeResponseOk = Boolean(response?.ok);
      }
    } catch (probeError) {
      console.log('Stream probe failed during buffering check:', probeError?.message || probeError);
    } finally {
      if (probeTimeoutId) {
        clearTimeout(probeTimeoutId);
      }
    }

    if (
      probeResponseOk &&
      extensionCount < STREAM_CONFIG.MAX_PROBE_EXTENSIONS &&
      requestToken === activeRequestToken
    ) {
      bufferingTimeoutId = setTimeout(
        () =>
          checkBufferingStatus(station, retryCount, {
            requestToken,
            startedAt,
            extensionCount: extensionCount + 1,
          }),
        Math.floor(STREAM_CONFIG.BUFFERING_TIMEOUT / 2)
      );
      return;
    }

    if (streamStatusCallback) {
      streamStatusCallback({ state: PLAYBACK_STATUS.BUFFERING_FAILED, station });
    }
    handleStreamError('Buffering timeout - stream may be slow or unavailable', station, retryCount, requestToken);
  } catch (error) {
    handleStreamError(`Status check error: ${error.message}`, station, retryCount, requestToken);
  }
}

function handleStreamError(message, station = null, retryCount = 0, requestToken = activeRequestToken) {
  if (requestToken !== activeRequestToken) {
    return;
  }

  console.error('Stream error:', message);
  clearStreamTimeouts();

  if (
    isRetryableError(message) &&
    station &&
    retryCount < STREAM_CONFIG.RETRY_ATTEMPTS &&
    requestToken === activeRequestToken
  ) {
    const nextAttempt = retryCount + 1;
    const retryDelay = getRetryDelay(nextAttempt);

    if (streamStatusCallback) {
      streamStatusCallback({
        state: PLAYBACK_STATUS.RETRYING,
        attempt: nextAttempt,
        message,
        retryDelay,
      });
    }

    retryTimeoutId = setTimeout(async () => {
      if (requestToken !== activeRequestToken) {
        return;
      }

      try {
        await stopTrack({ invalidateToken: false });
      } catch {
        // ignore
      }

      if (requestToken !== activeRequestToken) {
        return;
      }

      try {
        await addTrack(station, nextAttempt, requestToken);
        await playTrack(station, nextAttempt, requestToken);
      } catch (error) {
        handleStreamError(error.message || 'Retry failure', station, nextAttempt, requestToken);
      }
    }, retryDelay);
    return;
  }

  if (errorCallback) {
    errorCallback({
      message,
      station,
      retryCount,
      final: true,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function setupPlayer() {
  if (playerInitialized) {
    return true;
  }

  if (playerSetupPromise) {
    return playerSetupPromise;
  }

  playerSetupPromise = (async () => {
    try {
      await TrackPlayer.getCurrentTrack();
      playerInitialized = true;
      return true;
    } catch {
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 10,
        iosCategory: 'playback',
        alwaysPauseOnInterruption: true,
      });

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 1,
      });

      playerInitialized = true;
      return true;
    } finally {
      playerSetupPromise = null;
    }
  })();

  return playerSetupPromise;
}

export async function addTrack(station, retryCount = 0, requestToken = nextRequestToken()) {
  try {
    if (requestToken === activeRequestToken) {
      clearStreamTimeouts();
    }

    if (!station.url || !isValidStreamUrl(station.url)) {
      throw new Error('Invalid stream URL');
    }

    await TrackPlayer.add({
      id: station.id.toString(),
      url: station.url,
      title: station.name,
      artist: 'Live Radio',
      description: station.description,
      artwork: station.image,
      isLiveStream: true,
      headers: {
        'User-Agent': 'Lebanese Radio Player/1.0',
        Accept: 'audio/*',
      },
    });

    connectionTimeoutId = setTimeout(() => {
      handleStreamError('Connection timeout', station, retryCount, requestToken);
    }, STREAM_CONFIG.CONNECTION_TIMEOUT);
  } catch (error) {
    console.error('Error adding track:', error);
    throw error;
  }
}

export async function playTrack(station = null, retryCount = 0, requestToken = activeRequestToken) {
  try {
    await TrackPlayer.play();

    bufferingTimeoutId = setTimeout(
      () =>
        checkBufferingStatus(station, retryCount, {
          requestToken,
          startedAt: Date.now(),
          extensionCount: 0,
        }),
      STREAM_CONFIG.BUFFERING_TIMEOUT
    );
  } catch (error) {
    console.error('Error playing track:', error);
    handleStreamError(`Playback error: ${error.message}`, station, retryCount, requestToken);
    throw error;
  }
}

export async function pauseTrack() {
  await TrackPlayer.pause();
}

export async function stopTrack(options = {}) {
  const { invalidateToken = true } = options;
  try {
    if (invalidateToken) {
      nextRequestToken();
    }
    clearStreamTimeouts();
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Error stopping track:', error);
    clearStreamTimeouts();
  }
}

export async function skipToNext() {
  await TrackPlayer.skipToNext();
}

export async function skipToPrevious() {
  await TrackPlayer.skipToPrevious();
}

export function setStreamStatusCallback(callback) {
  streamStatusCallback = callback;
}

export function setErrorCallback(callback) {
  errorCallback = callback;
}

export async function getStreamStatus() {
  try {
    const [state, currentTrack, position, duration] = await Promise.all([
      TrackPlayer.getState(),
      TrackPlayer.getCurrentTrack(),
      TrackPlayer.getPosition(),
      TrackPlayer.getDuration(),
    ]);

    return {
      state,
      currentTrack,
      position,
      duration,
      isLiveStream: currentTrack?.isLiveStream || false,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting stream status:', error);
    return {
      state: State.None,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export const playbackService = async function () {
  if (listenersRegistered) {
    return;
  }
  listenersRegistered = true;

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    clearStreamTimeouts();
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    clearStreamTimeouts();
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    clearStreamTimeouts();
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

  TrackPlayer.addEventListener(Event.PlaybackError, async (error) => {
    const signature = `${activeRequestToken}:${error?.code || 'unknown'}:${error?.message || 'Unknown error'}`;
    const now = Date.now();
    if (signature === lastPlaybackErrorSignature && now - lastPlaybackErrorAt < 2000) {
      return;
    }
    lastPlaybackErrorSignature = signature;
    lastPlaybackErrorAt = now;

    console.error('Playback error event:', error);
    const station = await getCurrentTrackStation();
    handleStreamError(`Playback error: ${error.message || 'Unknown error'}`, station, 0, activeRequestToken);
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    if (event.state === State.Playing) {
      clearStreamTimeouts();
    }

    if (streamStatusCallback) {
      streamStatusCallback(event);
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, () => {
    clearStreamTimeouts();
  });
};
