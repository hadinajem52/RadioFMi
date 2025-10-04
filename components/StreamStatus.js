import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import { recheckBuffering } from '../services/TrackPlayerService';

const StreamStatus = ({ 
  currentStation, 
  isPlaying, 
  isLoading, 
  size = 'medium',
  showText = true,
  textColor = '#fff',
  iconColor = '#fff',
  style = {}
}) => {
  const [streamStatus, setStreamStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBuffering, setIsBuffering] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  
  const playbackState = usePlaybackState();
  const timeoutRef = useRef(null);
  const bufferingTimeoutRef = useRef(null);
  const lastRecheckRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const errorLoggedRef = useRef(false);

  // Size configurations
  const sizeConfig = {
    small: { iconSize: 16, fontSize: 12, padding: 4 },
    medium: { iconSize: 20, fontSize: 14, padding: 6 },
    large: { iconSize: 24, fontSize: 16, padding: 8 }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

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

  // Monitor stream status based on playback state and loading
  useEffect(() => {
    if (!currentStation) {
      setStreamStatus('idle');
      setErrorMessage('');
      clearTimeouts();
      return;
    }

    // Handle loading state
    if (isLoading) {
      setStreamStatus('connecting');
      setErrorMessage('');
      setConnectionTimeout(false);
      
      // Set connection timeout - but don't set error status, just mark timeout
      timeoutRef.current = setTimeout(() => {
        setConnectionTimeout(true);
      }, 15000); // 15 second timeout

      return;
    }

    // Clear connection timeout when not loading
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Handle playback states
    switch (playbackState?.state) {
      case State.Playing:
        setStreamStatus('live');
        setErrorMessage('');
        setIsBuffering(false);
        setConnectionTimeout(false);
        break;
        
      case State.Buffering:
        setStreamStatus('buffering');
        setErrorMessage('');
        setIsBuffering(true);
        setConnectionTimeout(false);
        
        // Set buffering timeout - but keep buffering status
        bufferingTimeoutRef.current = setTimeout(() => {
          if (playbackState?.state === State.Buffering) {
            setConnectionTimeout(true);

            // Trigger an immediate recheck when UI marks buffering as failed.
            const now = Date.now();
            if (now - lastRecheckRef.current > 5000) { // 5s debounce
              lastRecheckRef.current = now;
              recheckBuffering().then((ok) => {
                if (ok) {
                  // Re-check succeeded; clear the timeout flag so UI returns to buffering or live
                  setConnectionTimeout(false);
                }
              }).catch(() => {});
            }
          }
        }, 30000); // 30 second buffering timeout
        break;
        
      case State.Paused:
        setStreamStatus('paused');
        setErrorMessage('');
        setIsBuffering(false);
        setConnectionTimeout(false);
        break;
        
      case State.Stopped:
        setStreamStatus('stopped');
        setErrorMessage('');
        setIsBuffering(false);
        setConnectionTimeout(false);
        break;
        
      case State.Error:
        // Don't set error status, fallback to stopped
        setStreamStatus('stopped');
        setErrorMessage('');
        setIsBuffering(false);
        setConnectionTimeout(false);
        break;
        
      case State.Ready:
        if (isPlaying) {
          setStreamStatus('live');
        } else {
          setStreamStatus('ready');
        }
        setErrorMessage('');
        setIsBuffering(false);
        setConnectionTimeout(false);
        break;
        
      default:
        if (currentStation && !isLoading) {
          setStreamStatus('idle');
        }
        break;
    }

    // Clear buffering timeout when state changes
    if (playbackState?.state !== State.Buffering && bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }

  }, [playbackState?.state, isLoading, isPlaying, currentStation]);

  // Monitor TrackPlayer errors
  useEffect(() => {
    const checkForErrors = async () => {
      try {
        const state = await TrackPlayer.getState();
        // Log only once per error transition
        if (state === State.Error) {
          if (!errorLoggedRef.current) {
            console.log('TrackPlayer error state detected');
            errorLoggedRef.current = true;
          }
        } else if (errorLoggedRef.current) {
          // Reset flag when leaving error state so future errors log once again
          errorLoggedRef.current = false;
        }
      } catch (error) {
        console.log('Error checking TrackPlayer state:', error);
      }
    };

    if (currentStation) {
      const interval = setInterval(checkForErrors, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStation]);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const getStatusDisplay = () => {
    switch (streamStatus) {
      case 'connecting':
        return {
          icon: null,
          text: connectionTimeout ? 'Connection Failed' : 'Connecting...',
          color: connectionTimeout ? '#ffa500' : '#ffa500',
          showSpinner: !connectionTimeout
        };
        
      case 'buffering':
        return {
          icon: null,
          text: connectionTimeout ? 'Buffering Failed' : 'Buffering...',
          color: '#ffa500',
          showSpinner: !connectionTimeout
        };
        
      case 'live':
        return {
          icon: 'radio',
          text: 'LIVE',
          color: '#00ff00',
          showSpinner: false,
          animated: true
        };
        
      case 'paused':
        return {
          icon: 'pause-circle',
          text: 'Paused',
          color: '#ffa500',
          showSpinner: false
        };
        
      case 'stopped':
        return {
          icon: 'stop-circle',
          text: 'Stopped',
          color: '#888',
          showSpinner: false
        };
        
      case 'ready':
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

  if (streamStatus === 'idle' && !currentStation) {
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
