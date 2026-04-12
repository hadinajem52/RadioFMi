import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

const StationWebViewModal = ({ visible, url, onClose, title = 'Web Player' }) => {
  const appState = useRef(AppState.currentState);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Activate keep awake only when we have explicit playback signal from WebView.
    if (visible && isAudioPlaying) {
      activateKeepAwake('webview-audio');
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
        if (isAudioPlaying) {
          activateKeepAwake('webview-audio');
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAudioPlaying]);

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
          source={{ uri: url }}
          onLoadStart={() => setIsAudioPlaying(false)}
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
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'audioState') {
                setIsAudioPlaying(Boolean(data.playing));
              }
            } catch (_) {
              // Ignore non-JSON messages
            }
          }}
          injectedJavaScript={`
            (function() {
              if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                window.audioContext = new AudioContextClass();
              }

              document.addEventListener('visibilitychange', function(e) {
                e.stopPropagation();
              }, true);

              Object.defineProperty(document, 'hidden', { value: false, writable: false });
              Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });

              function postAudioState(playing) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'audioState',
                  playing: !!playing
                }));
              }

              function isAnyMediaPlaying() {
                const mediaNodes = document.querySelectorAll('audio, video');
                for (const media of mediaNodes) {
                  if (!media.paused && !media.ended) {
                    return true;
                  }
                }
                return false;
              }

              function bindMediaNode(media) {
                if (!media || media.__rnBound) return;
                media.__rnBound = true;
                media.setAttribute('playsinline', 'true');
                media.addEventListener('play', function() { postAudioState(true); });
                media.addEventListener('pause', function() { postAudioState(isAnyMediaPlaying()); });
                media.addEventListener('ended', function() { postAudioState(isAnyMediaPlaying()); });
              }

              function bindAllMedia() {
                document.querySelectorAll('audio, video').forEach(bindMediaNode);
              }

              bindAllMedia();
              postAudioState(isAnyMediaPlaying());

              const observer = new MutationObserver(function() {
                bindAllMedia();
                postAudioState(isAnyMediaPlaying());
              });
              observer.observe(document.documentElement || document.body, {
                childList: true,
                subtree: true
              });

              setInterval(function() {
                postAudioState(isAnyMediaPlaying());
              }, 2000);

              true;
            })();
          `}
          style={{ flex: 1, backgroundColor: '#0a0e27' }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default StationWebViewModal;
