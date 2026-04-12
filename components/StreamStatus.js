import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaybackState, State } from 'react-native-track-player';
import { PLAYBACK_STATUS } from '../utils/playbackStatus';

const StreamStatus = ({ 
  currentStation, 
  isPlaying, 
  isLoading, 
  connectionStatus,
  size = 'medium',
  showText = true,
  textColor = '#fff',
  style = {}
}) => {
  const playbackState = usePlaybackState();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfig = {
    small: { iconSize: 16, fontSize: 12, padding: 4 },
    medium: { iconSize: 20, fontSize: 14, padding: 6 },
    large: { iconSize: 24, fontSize: 16, padding: 8 }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const getStreamStatus = () => {
    if (!currentStation) {
      return PLAYBACK_STATUS.IDLE;
    }

    if (connectionStatus === PLAYBACK_STATUS.BUFFERING_FAILED) {
      return PLAYBACK_STATUS.BUFFERING_FAILED;
    }

    if (connectionStatus === PLAYBACK_STATUS.RETRYING) {
      return PLAYBACK_STATUS.RETRYING;
    }

    if (connectionStatus === PLAYBACK_STATUS.ERROR) {
      return PLAYBACK_STATUS.ERROR;
    }

    if (isLoading || connectionStatus === PLAYBACK_STATUS.CONNECTING) {
      return PLAYBACK_STATUS.CONNECTING;
    }

    switch (connectionStatus) {
      case PLAYBACK_STATUS.PLAYING:
        return 'live';
      case PLAYBACK_STATUS.BUFFERING:
        return PLAYBACK_STATUS.BUFFERING;
      case PLAYBACK_STATUS.PAUSED:
        return PLAYBACK_STATUS.PAUSED;
      case PLAYBACK_STATUS.STOPPED:
        return PLAYBACK_STATUS.STOPPED;
      case PLAYBACK_STATUS.READY:
        return isPlaying ? 'live' : 'ready';
      default:
        switch (playbackState?.state) {
          case State.Playing:
            return 'live';
          case State.Buffering:
            return PLAYBACK_STATUS.BUFFERING;
          case State.Paused:
            return PLAYBACK_STATUS.PAUSED;
          case State.Stopped:
            return PLAYBACK_STATUS.STOPPED;
          case State.Ready:
            return isPlaying ? 'live' : 'ready';
          default:
            return PLAYBACK_STATUS.IDLE;
        }
    }
  };

  const streamStatus = getStreamStatus();

  // Pulse animation for live indicator
  useEffect(() => {
    if (streamStatus === 'live') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [streamStatus, pulseAnim]);

  const getStatusDisplay = () => {
    switch (streamStatus) {
      case 'connecting':
        return {
          icon: null,
          text: 'Connecting...',
          color: '#ffa500',
          showSpinner: true
        };

      case PLAYBACK_STATUS.RETRYING:
        return {
          icon: null,
          text: 'Reconnecting...',
          color: '#ffa500',
          showSpinner: true
        };
        
      case PLAYBACK_STATUS.BUFFERING:
        return {
          icon: null,
          text: 'Buffering...',
          color: '#ffa500',
          showSpinner: true
        };

      case PLAYBACK_STATUS.BUFFERING_FAILED:
        return {
          icon: 'warning',
          text: 'Buffering Failed',
          color: '#ffa500',
          showSpinner: false
        };

      case PLAYBACK_STATUS.ERROR:
        return {
          icon: 'alert-circle',
          text: 'Connection Failed',
          color: '#ff6b6b',
          showSpinner: false
        };
        
      case 'live':
        return {
          icon: 'radio',
          text: 'LIVE',
          color: '#00ff00',
          showSpinner: false,
          animated: true
        };
        
      case PLAYBACK_STATUS.PAUSED:
        return {
          icon: 'pause-circle',
          text: 'Paused',
          color: '#ffa500',
          showSpinner: false
        };
        
      case PLAYBACK_STATUS.STOPPED:
        return {
          icon: 'stop-circle',
          text: 'Stopped',
          color: '#888',
          showSpinner: false
        };
        
      case PLAYBACK_STATUS.READY:
        return {
          icon: 'checkmark-circle',
          text: 'Ready',
          color: '#00ff00',
          showSpinner: false
        };
        
      default:
        return {
          icon: 'radio-outline',
          text: 'Idle',
          color: '#888',
          showSpinner: false
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (streamStatus === PLAYBACK_STATUS.IDLE && !currentStation) {
    return null;
  }

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent', // Let parent control background
      paddingHorizontal: config.padding,
      paddingVertical: config.padding / 2,
      borderRadius: config.padding,
    }, style]}>
      {statusDisplay.showSpinner ? (
        <ActivityIndicator 
          size="small" 
          color={statusDisplay.color} 
          style={{ marginRight: showText ? 6 : 0 }}
        />
      ) : statusDisplay.icon ? (
        <Animated.View style={{
          opacity: statusDisplay.animated ? pulseAnim : 1,
          marginRight: showText ? 6 : 0
        }}>
          <Ionicons 
            name={statusDisplay.icon} 
            size={config.iconSize} 
            color={statusDisplay.color}
          />
        </Animated.View>
      ) : null}
      
      {showText && (
        <Text style={{
          color: textColor,
          fontSize: config.fontSize,
          fontWeight: '500'
        }}>
          {statusDisplay.text}
        </Text>
      )}
    </View>
  );
};

export default StreamStatus;
