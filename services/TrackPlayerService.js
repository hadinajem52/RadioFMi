import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State
} from 'react-native-track-player';
import { PLAYBACK_STATUS } from '../utils/playbackStatus';

// Stream status tracking
let streamStatusCallback = null;
let errorCallback = null;
let connectionTimeoutId = null;
let bufferingTimeoutId = null;

// Stream monitoring configuration
const STREAM_CONFIG = {
  CONNECTION_TIMEOUT: 15000, // 15 seconds
  BUFFERING_TIMEOUT: 45000,  // 45 seconds (give slow streams more time)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
};

export async function setupPlayer() {
  let isSetup = false;
  try {
    await TrackPlayer.getCurrentTrack();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 10, // 10MB cache
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

    isSetup = true;
  } finally {
    return isSetup;
  }
}

// Enhanced add track with stream validation
export async function addTrack(station, retryCount = 0) {
  try {
    // Clear any existing timeouts
    clearStreamTimeouts();
    
    // Validate stream URL
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
        'Accept': 'audio/*',
      },
    });

    // Set connection timeout
    connectionTimeoutId = setTimeout(() => {
      handleStreamError('Connection timeout', station, retryCount);
    }, STREAM_CONFIG.CONNECTION_TIMEOUT);

  } catch (error) {
    console.error('Error adding track:', error);

    throw error;
  }
}

// Enhanced play function with monitoring
export async function playTrack(station = null, retryCount = 0) {
  try {
    await TrackPlayer.play();
    
    // Monitor for buffering timeout
    bufferingTimeoutId = setTimeout(() => {
      checkBufferingStatus(station, retryCount);
    }, STREAM_CONFIG.BUFFERING_TIMEOUT);
    
  } catch (error) {
    console.error('Error playing track:', error);
    handleStreamError(`Playback error: ${error.message}`, station, retryCount);
    throw error;
  }
}

export async function pauseTrack() {
  await TrackPlayer.pause();
}

export async function stopTrack() {
  try {
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

// Stream monitoring functions
export function setStreamStatusCallback(callback) {
  streamStatusCallback = callback;
}

export function setErrorCallback(callback) {
  errorCallback = callback;
}

// Clear stream timeouts
function clearStreamTimeouts() {
  if (connectionTimeoutId) {
    clearTimeout(connectionTimeoutId);
    connectionTimeoutId = null;
  }
  if (bufferingTimeoutId) {
    clearTimeout(bufferingTimeoutId);
    bufferingTimeoutId = null;
  }
}

// Validate stream URL
function isValidStreamUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

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

// Handle stream errors
function handleStreamError(message, station = null, retryCount = 0) {
  console.error('Stream error:', message);
  clearStreamTimeouts();

  // Determine if this error type is eligible for automatic retry
  const isTimeout = /timeout/i.test(message) || /buffering/i.test(message);
  const targetStation = station;

  if (isTimeout && targetStation && retryCount < STREAM_CONFIG.RETRY_ATTEMPTS) {
    const nextAttempt = retryCount + 1;
    console.log(`Auto-retry attempt ${nextAttempt} of ${STREAM_CONFIG.RETRY_ATTEMPTS} for station: ${targetStation.name}`);
    // Inform UI we're retrying without surfacing a fatal error
    if (streamStatusCallback) {
      streamStatusCallback({ state: PLAYBACK_STATUS.RETRYING, attempt: nextAttempt, message });
    }
    // Schedule retry
    setTimeout(async () => {
      try {
        await stopTrack(); // Ensure clean state
      } catch {}
      try {
        await addTrack(targetStation, nextAttempt); // addTrack will set its own timeouts
        await playTrack(targetStation, nextAttempt);
      } catch (e) {
        // If add/play fails here, recurse to potentially continue retries or emit final error
        handleStreamError(e.message || 'Retry failure', targetStation, nextAttempt);
      }
    }, STREAM_CONFIG.RETRY_DELAY);
    return; // Defer error callback until final failure
  }

  // Final failure (or non-timeout error) -> notify UI
  if (errorCallback) {
    errorCallback({
      message,
      station: targetStation,
      retryCount,
      final: true,
      timestamp: new Date().toISOString()
    });
  }
}

// Check buffering status
async function checkBufferingStatus(station, retryCount = 0) {
  try {
    // Sometimes streams take a little longer to prime. Do several quick re-checks
    // before deciding the stream has failed. This reduces false positives for
    // slow-but-working stations.
    const maxChecks = 5;
    const checkDelayMs = 2000; // 2 seconds between quick re-checks

    for (let i = 0; i < maxChecks; i++) {
      // If timeouts were cleared elsewhere (e.g., state changed to Playing), abort
      if (!bufferingTimeoutId) return;

      const state = await TrackPlayer.getState();
      if (state !== State.Buffering) {
        // Playback progressed; clear timeouts and return without surfacing an error
        clearStreamTimeouts();
        return;
      }

      if (i < maxChecks - 1) {
        await new Promise(resolve => setTimeout(resolve, checkDelayMs));
      }
    }

    // After repeated checks still buffering -> do a lightweight HEAD probe of the stream
    // If the probe shows the endpoint is reachable, extend the buffering window once
    try {
      if (station && station.url) {
        const controller = new AbortController();
        const probeTimeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(station.url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(probeTimeout);

        if (response && response.ok) {
          // Stream endpoint reachable; give more time and reschedule a check
          bufferingTimeoutId = setTimeout(() => checkBufferingStatus(station, retryCount), Math.floor(STREAM_CONFIG.BUFFERING_TIMEOUT / 2));
          return;
        }
      }
    } catch (probeError) {
      // Ignore probe errors and fall through to final failure handling
      console.log('Stream probe failed during buffering check:', probeError?.message || probeError);
    }

    // Still buffering after retries and probe -> treat as failure
    // Notify UI explicitly about buffering failure before triggering error handling
    if (streamStatusCallback) {
      try { streamStatusCallback({ state: PLAYBACK_STATUS.BUFFERING_FAILED, station }); } catch {}
    }
    handleStreamError('Buffering timeout - stream may be slow or unavailable', station, retryCount);
  } catch (error) {
    handleStreamError(`Status check error: ${error.message}`, station, retryCount);
  }
}

// Get detailed stream status
export async function getStreamStatus() {
  try {
    const [state, currentTrack, position, duration] = await Promise.all([
      TrackPlayer.getState(),
      TrackPlayer.getCurrentTrack(),
      TrackPlayer.getPosition(),
      TrackPlayer.getDuration()
    ]);

    return {
      state,
      currentTrack,
      position,
      duration,
      isLiveStream: currentTrack?.isLiveStream || false,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting stream status:', error);
    return {
      state: State.None,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export const playbackService = async function() {
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
  
  // Enhanced error handling
  TrackPlayer.addEventListener(Event.PlaybackError, async (error) => {
    console.error('Playback error event:', error);
    const station = await getCurrentTrackStation();
    handleStreamError(`Playback error: ${error.message || 'Unknown error'}`, station);
  });
  
  // Track state changes
  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    console.log('Playback state changed:', event.state);
    
    // Clear timeouts on successful playback
    if (event.state === State.Playing) {
      clearStreamTimeouts();
    }
    
    if (streamStatusCallback) {
      streamStatusCallback(event);
    }
  });
  
  // Monitor track changes
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (event) => {
    console.log('Track changed:', event);
    clearStreamTimeouts();
  });
};
