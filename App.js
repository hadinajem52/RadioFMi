import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  FlatList, 
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import TrackPlayer, { usePlaybackState, useProgress, State } from 'react-native-track-player';
import { 
  setupPlayer, 
  addTrack, 
  playTrack, 
  pauseTrack, 
  stopTrack, 
  skipToNext, 
  skipToPrevious, 
  setVolume as setPlayerVolume,
  setStreamStatusCallback,
  setErrorCallback,
  getStreamStatus 
} from './services/TrackPlayerService';
import Header from './components/Header';
import FeaturedRadios from './components/FeaturedRadios';
import Favorites from './components/Favorites';
import LebaneseRadioStations from './components/LebaneseRadioStations';
import BottomPlayer from './components/BottomPlayer';
import FullscreenPlayer from './components/FullscreenPlayer';
import SearchModal from './components/SearchModal';
import SideMenu from './components/SideMenu';
import GenreRadioStations from './components/GenreRadioStations';
import Settings from './components/Settings';
import radioStations from './data/radioStations';
import styles from './styles/styles';

function App() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [streamError, setStreamError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Safe volume setter with validation
  const setSafeVolume = (newVolume) => {
    if (typeof newVolume === 'number' && !isNaN(newVolume) && newVolume >= 0 && newVolume <= 1) {
      setVolume(newVolume);
    } else {
      console.warn('Invalid volume value:', newVolume, 'keeping current volume:', volume);
    }
  };

  // Derive isPlaying from playbackState
  const isPlaying = playbackState?.state === State.Playing;

  // Initialize TrackPlayer on app start
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        const isSetup = await setupPlayer();
        setIsPlayerReady(isSetup);
        
        // Set up stream monitoring callbacks
        setStreamStatusCallback((event) => {
          console.log('Stream status update:', event);
          setConnectionStatus(event.state || 'unknown');
        });
        
        setErrorCallback((error) => {
          console.error('Stream error callback:', error);
          setStreamError(error);
          setIsLoading(false);
          
          // Show user-friendly error message
          if (error.message.includes('timeout')) {
            Alert.alert(
              'Connection Timeout', 
              'Unable to connect to the radio station. Please check your internet connection and try again.',
              [
                { text: 'OK', onPress: () => setStreamError(null) },
                { 
                  text: 'Retry', 
                  onPress: () => {
                    if (currentStation) {
                      playStation(currentStation);
                    }
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              'Stream Error', 
              error.message || 'Unable to play this radio station.',
              [{ text: 'OK', onPress: () => setStreamError(null) }]
            );
          }
        });
        
      } catch (error) {
        console.error('Error setting up player:', error);
        Alert.alert('Setup Error', 'Failed to initialize audio player');
      }
    };

    initializePlayer();

    return () => {
      // Cleanup on unmount
      TrackPlayer.destroy();
    };
  }, []);

  // Load favorites from AsyncStorage on app start
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    
    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever favorites change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };
    
    // Only save after the initial load (to avoid overwriting on app start)
    if (favorites.length >= 0) {
      saveFavorites();
    }
  }, [favorites]);

  // Update player volume when volume state changes
  useEffect(() => {
    const updateVolume = async () => {
      try {
        // Validate volume before setting
        if (typeof volume === 'number' && !isNaN(volume) && volume >= 0 && volume <= 1) {
          await setPlayerVolume(volume);
        } else {
          console.warn('Invalid volume value:', volume, 'skipping update');
        }
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    };
    
    if (isPlayerReady && volume !== undefined) {
      updateVolume();
    }
  }, [volume, isPlayerReady]);

  const playStation = async (station) => {
    if (!isPlayerReady) {
      Alert.alert('Error', 'Player is not ready yet');
      return;
    }

    try {
      setIsLoading(true);
      setCurrentStation(station);
      setStreamError(null);
      setConnectionStatus('connecting');
      
      // Stop current playback and clear queue
      await stopTrack();
      
      // Add the new station and play
      await addTrack(station);
      await playTrack();
      
      setIsLoading(false);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error playing station:', error);
      setIsLoading(false);
      setConnectionStatus('error');
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to play radio station';
      if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message.includes('Invalid stream URL')) {
        errorMessage = 'This radio station is currently unavailable.';
      } else if (error.message.includes('format')) {
        errorMessage = 'Unsupported audio format for this station.';
      }
      
      Alert.alert('Playback Error', errorMessage, [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: () => playStation(station)
        }
      ]);
    }
  };

  const togglePlayPause = async () => {
    if (!currentStation) return;
    
    console.log('Current playback state:', playbackState);
    console.log('isPlaying:', isPlaying);
    
    try {
      if (isPlaying) {
        console.log('Attempting to pause...');
        await pauseTrack();
      } else {
        console.log('Attempting to play...');
        await playTrack();
      }
      console.log('Action completed, new state:', await TrackPlayer.getState());
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      // If toggle fails, try to play the station again
      if (currentStation && !isPlaying) {
        playStation(currentStation);
      }
    }
  };

  const toggleFavorite = (station) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === station.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== station.id);
      } else {
        return [...prev, station];
      }
    });
  };

  const playNextStation = async () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex(s => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    await playStation(radioStations[nextIndex]);
  };

  const playPreviousStation = async () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex(s => s.id === currentStation.id);
    const prevIndex = currentIndex === 0 ? radioStations.length - 1 : currentIndex - 1;
    await playStation(radioStations[prevIndex]);
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    setShowGenreModal(true);
  };

  const handleSettingsPress = () => {
    setShowSettings(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <Header 
        styles={styles} 
        onSearchPress={() => setShowSearchModal(true)}
        onMenuPress={() => setShowSideMenu(true)}
      />

      <FlatList
        data={[1]} // Single item to wrap all content
        renderItem={() => (
          <View>
            {/* Featured Radios Section */}
            <FeaturedRadios 
              styles={styles}
              radioStations={radioStations}
              currentStation={currentStation}
              isPlaying={isPlaying}
              playStation={playStation}
              togglePlayPause={togglePlayPause}
              language={language}
            />

            {/* Favorites Section */}
            <Favorites 
              styles={styles}
              favorites={favorites}
              currentStation={currentStation}
              isPlaying={isPlaying}
              playStation={playStation}
              togglePlayPause={togglePlayPause}
              language={language}
            />

            {/* Lebanese Radio Stations Section */}
            <LebaneseRadioStations
              styles={styles}
              radioStations={radioStations}
              currentStation={currentStation}
              isPlaying={isPlaying}
              playStation={playStation}
              togglePlayPause={togglePlayPause}
              language={language}
            />
          </View>
        )}
        keyExtractor={() => 'content'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Bottom Player */}
      {currentStation && (
        <BottomPlayer
          styles={styles}
          currentStation={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          togglePlayPause={togglePlayPause}
          onPress={() => setShowFullscreenPlayer(true)}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          language={language}
        />
      )}

      {/* Fullscreen Player Modal */}
      <FullscreenPlayer
        visible={showFullscreenPlayer}
        onClose={() => setShowFullscreenPlayer(false)}
        currentStation={currentStation}
        isPlaying={isPlaying}
        isLoading={isLoading}
        togglePlayPause={togglePlayPause}
        playNextStation={playNextStation}
        playPreviousStation={playPreviousStation}
        volume={volume}
        setVolume={setSafeVolume}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        language={language}
      />

      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        radioStations={radioStations}
        currentStation={currentStation}
        isPlaying={isPlaying}
        playStation={playStation}
        togglePlayPause={togglePlayPause}
        styles={styles}
        language={language}
      />

      {/* Side Menu */}
      <SideMenu
        visible={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        onGenreSelect={handleGenreSelect}
        onSettingsPress={handleSettingsPress}
        styles={styles}
        language={language}
      />

      {/* Genre Radio Stations Modal */}
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
        language={language}
      />

      {/* Settings Modal */}
      <Settings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        volume={volume}
        setVolume={setSafeVolume}
        styles={styles}
      />
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
