import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Platform, SafeAreaView, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

const StationWebViewModal = ({ visible, url, onClose, title = 'Web Player' }) => {
  const webViewRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Activate keep awake when WebView is visible and potentially playing audio
    if (visible && isAudioPlaying) {
      activateKeepAwake('webview-audio');
      console.log('Keep awake activated for WebView audio');
    } else {
      deactivateKeepAwake('webview-audio');
    }

    return () => {
      deactivateKeepAwake('webview-audio');
    };
  }, [visible, isAudioPlaying]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - WebView should already be playing
        console.log('App has come to the foreground');
        // Re-activate keep awake if audio was playing
        if (isAudioPlaying) {
          activateKeepAwake('webview-audio');
        }
      }

      if (nextAppState.match(/inactive|background/)) {
        // App is going to background - keep WebView alive
        console.log('App is going to background - maintaining WebView audio');
        // Keep awake remains active
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAudioPlaying]);

  const handleClose = () => {
    setIsAudioPlaying(false);
    deactivateKeepAwake('webview-audio');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0e27' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: '#0a0e27',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)'
        }}>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close web view">
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{
          backgroundColor: 'rgba(124, 77, 255, 0.1)',
          paddingVertical: 8,
          paddingHorizontal: 12,
          marginHorizontal: 12,
          marginTop: 8,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}>
          <Ionicons name="information-circle-outline" size={16} color="#7C4DFF" />
          <Text style={{ color: '#7C4DFF', fontSize: 12, flex: 1 }}>
            Audio will continue playing with screen off. Press close to stop.
          </Text>
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e27' }}>
              <ActivityIndicator size="large" color="#7C4DFF" />
              <Text style={{ color: '#fff', marginTop: 12 }}>Loading web player…</Text>
            </View>
          )}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          incognito={true}
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          mixedContentMode="always"
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          onError={() => { /* keep silent; the page can show its own error */ }}
          onLoadEnd={() => {
            // Assume audio will start playing after page loads
            setTimeout(() => setIsAudioPlaying(true), 2000);
          }}
          onMessage={(event) => {
            console.log('WebView message:', event.nativeEvent.data);
            // Check for audio playback messages
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'audioState') {
                setIsAudioPlaying(data.playing);
              }
            } catch (e) {
              // Not JSON, ignore
            }
          }}
          injectedJavaScript={`
            // Enable background audio for WebView
            (function() {
              // Set audio context to allow background playback
              if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                window.audioContext = new AudioContextClass();
              }
              
              // Prevent audio from pausing on visibility change
              document.addEventListener('visibilitychange', function(e) {
                e.stopPropagation();
              }, true);
              
              // Override page visibility API to always report as visible
              Object.defineProperty(document, 'hidden', { value: false, writable: false });
              Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });
              
              // Keep audio elements playing and monitor state
              const audioElements = document.getElementsByTagName('audio');
              for (let audio of audioElements) {
                audio.setAttribute('playsinline', 'true');
                
                // Monitor audio playback state
                audio.addEventListener('play', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'audioState',
                    playing: true
                  }));
                });
                
                audio.addEventListener('pause', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'audioState',
                    playing: false
                  }));
                });
              }
              
              // Also monitor video elements
              const videoElements = document.getElementsByTagName('video');
              for (let video of videoElements) {
                video.setAttribute('playsinline', 'true');
                
                video.addEventListener('play', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'audioState',
                    playing: true
                  }));
                });
                
                video.addEventListener('pause', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'audioState',
                    playing: false
                  }));
                });
              }
              
              true; // Required for injected JavaScript
            })();
          `}
          style={{ flex: 1, backgroundColor: '#0a0e27' }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default StationWebViewModal;
