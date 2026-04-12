import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  ScrollView, 
  Alert,
  Text,
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LanguageProvider } from './contexts/LanguageContext';
import * as Font from 'expo-font';
import {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { usePlayer } from './hooks/usePlayer';
import { useFavorites } from './hooks/useFavorites';
import { useSorting } from './hooks/useSorting';
import Header from './components/Header';
import FeaturedRadios from './components/FeaturedRadios';
import Favorites from './components/Favorites';
import LebaneseRadioStations from './components/LebaneseRadioStations';
import BottomPlayer from './components/BottomPlayer';
import FullscreenPlayer from './components/FullscreenPlayer';
import SearchModal from './components/SearchModal';
import StationWebViewModal from './components/StationWebViewModal';
import { registerWebViewOpener } from './utils/webViewFallback';
import { stopTrack } from './services/TrackPlayerService';
import SideMenu from './components/SideMenu';
import GenreRadioStations from './components/GenreRadioStations';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import Settings from './components/Settings';
import radioStations from './data/radioStations';
import StreamUrlCache from './services/StreamUrlCache';
import styles from './styles/styles';
import { PLAYBACK_STATUS } from './utils/playbackStatus';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewTitle, setWebViewTitle] = useState('Web Player');
  
  // Custom hooks for player and favorites management
  const {
    isLoading,
    currentStation,
    connectionStatus,
    isPlaying,
    isConnected,
    isInternetReachable,
    hasGoodConnection,
    playStation,
    togglePlayPause,
    playNextStation,
    playPreviousStation,
  } = usePlayer();
  
  const { favorites, toggleFavorite } = useFavorites();
  const { sortOption, setSortPreference, sortStations, isLoaded: isSortingLoaded } = useSorting();

  // Initialize app - Load fonts and setup basic app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load custom fonts
        await Font.loadAsync({
          'Poppins-Thin': Poppins_100Thin,
          'Poppins-ExtraLight': Poppins_200ExtraLight,
          'Poppins-Light': Poppins_300Light,
          'Poppins-Regular': Poppins_400Regular,
          'Poppins-Medium': Poppins_500Medium,
          'Poppins-SemiBold': Poppins_600SemiBold,
          'Poppins-Bold': Poppins_700Bold,
          'Poppins-ExtraBold': Poppins_800ExtraBold,
          'Poppins-Black': Poppins_900Black,
        });
        setFontsLoaded(true);

        // Simulate minimum loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // App is ready
        setIsAppLoading(false);
        
      } catch (error) {
        console.error('Error setting up app:', error);
        Alert.alert('Setup Error', 'Failed to initialize app');
        setIsAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Pre-fetch stream URLs from OnlineRadioBox in the background at launch
  useEffect(() => {
    StreamUrlCache.prefetchAll(radioStations);
  }, []);

  // Register a global opener for the fallback web view
  useEffect(() => {
    return registerWebViewOpener(async (url, title) => {
      try {
        // Force stop any ongoing radio playback before opening WebView
        await stopTrack();
      } catch (_) {
        // ignore
      } finally {
        setWebViewUrl(url);
        setWebViewTitle(title || 'Web Player');
        setWebViewVisible(true);
      }
    });
  }, []);

  // Memoize the sorted list of radio stations to prevent re-sorting on every render
  const sortedStations = useMemo(() => {
    if (!isSortingLoaded) {
      return radioStations;
    }
    return sortStations(radioStations, favorites, currentStation);
  }, [sortOption, favorites, currentStation, isSortingLoaded, sortStations]);

  // Auto-open fullscreen player on buffering failure to give user immediate controls/retry
  useEffect(() => {
    if (connectionStatus === PLAYBACK_STATUS.BUFFERING_FAILED && currentStation) {
      setShowFullscreenPlayer(true);
    }
  }, [connectionStatus, currentStation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#2d1b69', '#4a1c6e', '#5a2d5a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar style="light" />

        {/* Loading Screen */}
        {(isAppLoading || !fontsLoaded) ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <Image 
                source={require('./assets/icon.png')} 
                style={styles.loadingLogo}
                resizeMode="contain"
              />
              <Text style={styles.loadingTitle}>Lebanese Radio Player</Text>
              <Text style={styles.loadingSubtitle}>Your favorite radio stations</Text>
              <ActivityIndicator 
                size="large" 
                color="#7C4DFF" 
                style={styles.loadingSpinner}
              />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        ) : (
          <>
            {/* Use ScrollView instead of FlatList for non-virtualized content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              <View>
                {/* Featured Radios Section */}
                <FeaturedRadios 
                  styles={styles}
                  radioStations={radioStations}
                  currentStation={currentStation}
                  isPlaying={isPlaying}
                  playStation={playStation}
                  togglePlayPause={togglePlayPause}
                />

                {/* Favorites Section */}
                <Favorites 
                  styles={styles}
                  favorites={favorites}
                  currentStation={currentStation}
                  isPlaying={isPlaying}
                  playStation={playStation}
                  togglePlayPause={togglePlayPause}
                />

                {/* Lebanese Radio Stations Section */}
                <LebaneseRadioStations
                  styles={styles}
                  radioStations={sortedStations}
                  currentStation={currentStation}
                  isPlaying={isPlaying}
                  playStation={playStation}
                  togglePlayPause={togglePlayPause}
                  sortOption={sortOption}
                  onSortOptionChange={setSortPreference}
                  favorites={favorites}
                />
              </View>
            </ScrollView>

            {/* Header */}
            <Header 
              styles={styles} 
              onSearchPress={() => setShowSearchModal(true)}
              onMenuPress={() => setShowSideMenu(true)}
            />

            {/* Network Status Indicator */}
            <NetworkStatusIndicator
              isConnected={isConnected}
              isInternetReachable={isInternetReachable}
              hasGoodConnection={hasGoodConnection}
              styles={styles}
            />

            {/* Bottom Player */}
            {currentStation && (
              <BottomPlayer
                styles={styles}
                currentStation={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                connectionStatus={connectionStatus}
                togglePlayPause={togglePlayPause}
                onPress={() => setShowFullscreenPlayer(true)}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {/* Conditionally render modals to improve performance */}
            {showFullscreenPlayer && (
              <FullscreenPlayer
                visible={showFullscreenPlayer}
                onClose={() => setShowFullscreenPlayer(false)}
                currentStation={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                connectionStatus={connectionStatus}
                togglePlayPause={togglePlayPause}
                playNextStation={playNextStation}
                playPreviousStation={playPreviousStation}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {showSearchModal && (
              <SearchModal
                visible={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                radioStations={radioStations}
                currentStation={currentStation}
                isPlaying={isPlaying}
                playStation={playStation}
                togglePlayPause={togglePlayPause}
                styles={styles}
              />
            )}

            {showSideMenu && (
              <SideMenu
                visible={showSideMenu}
                onClose={() => setShowSideMenu(false)}
                onGenreSelect={(genreId) => {
                  setSelectedGenre(genreId);
                  setShowGenreModal(true);
                }}
                onSettingsPress={() => setShowSettings(true)}
                styles={styles}
              />
            )}

            {showGenreModal && (
              <GenreRadioStations
                visible={showGenreModal}
                onClose={() => setShowGenreModal(false)}
                genreId={selectedGenre}
                radioStations={radioStations}
                currentStation={currentStation}
                isPlaying={isPlaying}
                playStation={playStation}
                togglePlayPause={togglePlayPause}
                styles={styles}
              />
            )}

            {showSettings && (
              <Settings
                visible={showSettings}
                onClose={() => setShowSettings(false)}
                styles={styles}
              />
            )}

            {/* Fallback Web Player Modal */}
            <StationWebViewModal
              visible={webViewVisible}
              url={webViewUrl}
              title={webViewTitle}
              onClose={() => setWebViewVisible(false)}
            />
          </>
        )}
      </LinearGradient>
    </View>
  );
}

function AppWithProvider() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

export default AppWithProvider;
