import React, { useRef, useEffect } from 'react';
import { View, AppState, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

/**
 * BackgroundWebViewService - Invisible WebView that maintains audio playback
 * even when the app goes to the background and screen is off
 */
const BackgroundWebViewService = ({ url, isActive }) => {
  const webViewRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (isActive) {
      activateKeepAwake('background-webview');
      console.log('BackgroundWebViewService: Keep awake activated');
    } else {
      deactivateKeepAwake('background-webview');
      console.log('BackgroundWebViewService: Keep awake deactivated');
    }

    return () => {
      deactivateKeepAwake('background-webview');
    };
  }, [isActive]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        console.log('BackgroundWebViewService: App backgrounded, maintaining WebView');
        // Keep WebView reference alive
        if (webViewRef.current) {
          // Inject script to ensure audio keeps playing
          webViewRef.current.injectJavaScript(`
            (function() {
              const audioElements = document.querySelectorAll('audio, video');
              audioElements.forEach(el => {
                if (!el.paused) {
                  console.log('Ensuring media playback continues');
                  el.play().catch(e => console.log('Play error:', e));
                }
              });
            })();
            true;
          `);
        }
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('BackgroundWebViewService: App foregrounded');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isActive || !url) {
    return null;
  }

  return (
    <View style={{ height: 1, width: 1, opacity: 0, position: 'absolute' }}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        mixedContentMode="always"
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('BackgroundWebViewService error:', nativeEvent);
        }}
        injectedJavaScript={`
          // Enhanced background audio support
          (function() {
            console.log('BackgroundWebViewService: Initializing audio context');
            
            // Create audio context
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
              const AudioContextClass = window.AudioContext || window.webkitAudioContext;
              window.audioContext = new AudioContextClass();
              
              // Resume audio context on user interaction
              document.addEventListener('touchstart', function() {
                if (window.audioContext && window.audioContext.state === 'suspended') {
                  window.audioContext.resume();
                }
              }, { once: true });
            }
            
            // Override visibility API
            Object.defineProperty(document, 'hidden', { 
              get: function() { return false; },
              configurable: true 
            });
            
            Object.defineProperty(document, 'visibilityState', { 
              get: function() { return 'visible'; },
              configurable: true 
            });
            
            // Prevent pausing on visibility change
            document.addEventListener('visibilitychange', function(e) {
              e.stopImmediatePropagation();
              e.preventDefault();
            }, true);
            
            // Intercept pause events
            document.addEventListener('pause', function(e) {
              const target = e.target;
              if (target.tagName === 'AUDIO' || target.tagName === 'VIDEO') {
                console.log('Preventing pause event');
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => {
                  if (target.paused) {
                    target.play().catch(err => console.log('Resume error:', err));
                  }
                }, 100);
              }
            }, true);
            
            // Keep screen wake lock if available
            if ('wakeLock' in navigator) {
              navigator.wakeLock.request('screen').catch(err => {
                console.log('Wake lock error:', err);
              });
            }
            
            true;
          })();
        `}
        onMessage={(event) => {
          console.log('BackgroundWebViewService message:', event.nativeEvent.data);
        }}
        style={{ width: 1, height: 1, opacity: 0 }}
      />
    </View>
  );
};

export default BackgroundWebViewService;
