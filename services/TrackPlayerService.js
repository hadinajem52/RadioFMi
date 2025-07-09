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

    await TrackPlayer.add({
      id: station.id.toString(),
      url: station.url,
      title: station.name,
      artist: 'Live Radio',
      description: station.description,
      artwork: station.image,
      isLiveStream: true,
      headers: {
        'User-Agent': 'RadioFMi/1.0',
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
  await TrackPlayer.setVolume(volume);
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
  
  if (errorCallback) {
    errorCallback({
      message,
      station,
      retryCount,
      timestamp: new Date().toISOString()
    });
  }
}

// Check buffering status
async function checkBufferingStatus() {
  try {
    const state = await TrackPlayer.getState();
    if (state === State.Buffering) {
      handleStreamError('Buffering timeout - stream may be slow or unavailable');
    }
  } catch (error) {
    handleStreamError(`Status check error: ${error.message}`);
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
