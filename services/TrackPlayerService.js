import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  Event,
  State
} from 'react-native-track-player';

// Stream status tracking
let streamStatusCallback = null;
let errorCallback = null;
let connectionTimeoutId = null;
let bufferingTimeoutId = null;
let lastStation = null; // Keep reference to last attempted station for retries

// Stream monitoring configuration
const STREAM_CONFIG = {
  CONNECTION_TIMEOUT: 15000, // 15 seconds
  BUFFERING_TIMEOUT: 30000,  // 30 seconds
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

  // Remember the station for potential recovery retries
  lastStation = station;

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
    
    // Retry logic
    if (retryCount < STREAM_CONFIG.RETRY_ATTEMPTS) {
      console.log(`Retrying connection (${retryCount + 1}/${STREAM_CONFIG.RETRY_ATTEMPTS})...`);
      setTimeout(() => {
        addTrack(station, retryCount + 1);
      }, STREAM_CONFIG.RETRY_DELAY);
    } else {
      handleStreamError(`Failed to add track: ${error.message}`, station, retryCount);
      throw error;
    }
  }
}

// Enhanced play function with monitoring
export async function playTrack() {
  try {
    await TrackPlayer.play();
    
    // Monitor for buffering timeout
    bufferingTimeoutId = setTimeout(() => {
      checkBufferingStatus();
    }, STREAM_CONFIG.BUFFERING_TIMEOUT);
    
  } catch (error) {
    console.error('Error playing track:', error);
    handleStreamError(`Playback error: ${error.message}`);
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

export async function setVolume(volume) {
  try {
    // Validate volume value
    if (typeof volume !== 'number' || isNaN(volume)) {
      console.warn('Invalid volume value:', volume, 'defaulting to 1.0');
      volume = 1.0;
    }
    
    // Clamp volume between 0 and 1
    volume = Math.max(0, Math.min(1, volume));
    
    // Check if TrackPlayer is initialized by trying to get state
    try {
      await TrackPlayer.getState();
    } catch (initError) {
      console.warn('TrackPlayer not initialized, skipping volume set');
      return;
    }
    
    // Set volume with proper parameter formatting
    await TrackPlayer.setVolume(Number(volume));
    console.log('Volume set successfully to:', volume);
    
  } catch (error) {
    console.warn('Failed to set volume:', error.message);
    
    // If we get the specific "Malformed calls" error, try again with a delay
    if (error.message.includes('Malformed calls') || error.message.includes('field sizes')) {
      setTimeout(async () => {
        try {
          await TrackPlayer.setVolume(Number(Math.max(0, Math.min(1, volume || 1.0))));
          console.log('Volume set successfully on retry');
        } catch (retryError) {
          console.warn('Volume retry also failed:', retryError.message);
        }
      }, 100);
    }
    
    // Don't throw the error to prevent app crashes
  }
}

// Safe volume setter that can be used as a utility
export function setSafeVolume(volume, callback) {
  if (typeof volume === 'number' && !isNaN(volume) && volume >= 0 && volume <= 1) {
    setVolume(volume);
    if (callback) callback(volume);
  } else {
    console.warn('Invalid volume value:', volume, 'volume not changed');
  }
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

// Handle stream errors
function handleStreamError(message, station = null, retryCount = 0) {
  console.error('Stream error:', message);
  clearStreamTimeouts();

  // Determine if this error type is eligible for automatic retry
  const isTimeout = /timeout/i.test(message) || /buffering/i.test(message);
  const targetStation = station || lastStation;

  if (isTimeout && targetStation && retryCount < STREAM_CONFIG.RETRY_ATTEMPTS) {
    const nextAttempt = retryCount + 1;
    console.log(`Auto-retry attempt ${nextAttempt} of ${STREAM_CONFIG.RETRY_ATTEMPTS} for station: ${targetStation.name}`);
    // Inform UI we're retrying without surfacing a fatal error
    if (streamStatusCallback) {
      streamStatusCallback({ state: 'retrying', attempt: nextAttempt, message });
    }
    // Schedule retry
    setTimeout(async () => {
      try {
        await stopTrack(); // Ensure clean state
      } catch {}
      try {
        await addTrack(targetStation, nextAttempt); // addTrack will set its own timeouts
        await playTrack();
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
async function checkBufferingStatus() {
  try {
    const state = await TrackPlayer.getState();
    if (state === State.Buffering) {
      // Pass along lastStation & assume retryCount 0 for first buffering timeout if not already set.
      handleStreamError('Buffering timeout - stream may be slow or unavailable', lastStation, 0);
    }
  } catch (error) {
    handleStreamError(`Status check error: ${error.message}`, lastStation, 0);
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
  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('Playback error event:', error);
    handleStreamError(`Playback error: ${error.message || 'Unknown error'}`);
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
