import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  FlatList, 
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { usePlaybackState, useProgress, State } from 'react-native-track-player';
import { setupPlayer, addTrack, playTrack, pauseTrack, stopTrack, skipToNext, skipToPrevious } from './services/TrackPlayerService';
import Header from './components/Header';
import FeaturedRadios from './components/FeaturedRadios';
import Favorites from './components/Favorites';
import LebaneseRadioStations from './components/LebaneseRadioStations';
import BottomPlayer from './components/BottomPlayer';
import FullscreenPlayer from './components/FullscreenPlayer';
import radioStations from './data/radioStations';
import styles from './styles/styles';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Initialize TrackPlayer on app start
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        const isSetup = await setupPlayer();
        setIsPlayerReady(isSetup);
      } catch (error) {
        console.error('Error setting up player:', error);
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

  const playStation = async (station) => {
    if (!isPlayerReady) {
      Alert.alert('Error', 'Player is not ready yet');
      return;
    }

    try {
      setIsLoading(true);
      setCurrentStation(station);
      
      // Stop current playback and clear queue
      await stopTrack();
      
      // Add the new station and play
      await addTrack(station);
      await playTrack();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing station:', error);
      Alert.alert('Error', 'Failed to play radio station');
      setIsLoading(false);
    }
  };

  const pausePlayback = async () => {
    try {
      await pauseTrack();
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const resumePlayback = async () => {
    try {
      if (currentStation) {
        await playTrack();
      }
    } catch (error) {
      console.error('Error resuming playback:', error);
      // If resume fails, try to play the station again
      if (currentStation) {
        playStation(currentStation);
      }
    }
  };

  const stopPlayback = async () => {
    try {
      await stopTrack();
      setCurrentStation(null);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  // Check if currently playing
  const isPlaying = playbackState === State.Playing;

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <Header styles={styles} />

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
              pausePlayback={pausePlayback}
              resumePlayback={resumePlayback}
            />

            {/* Favorites Section */}
            <Favorites 
              styles={styles}
              favorites={favorites}
              currentStation={currentStation}
              isPlaying={isPlaying}
              playStation={playStation}
              pausePlayback={pausePlayback}
              resumePlayback={resumePlayback}
            />

            {/* Lebanese Radio Stations Section */}
            <LebaneseRadioStations
              styles={styles}
              radioStations={radioStations}
              currentStation={currentStation}
              isPlaying={isPlaying}
              playStation={playStation}
              pausePlayback={pausePlayback}
              resumePlayback={resumePlayback}
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
          pausePlayback={pausePlayback}
          resumePlayback={resumePlayback}
          onPress={() => setShowFullscreenPlayer(true)}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      {/* Fullscreen Player Modal */}
      <FullscreenPlayer
        visible={showFullscreenPlayer}
        onClose={() => setShowFullscreenPlayer(false)}
        currentStation={currentStation}
        isPlaying={isPlaying}
        isLoading={isLoading}
        pausePlayback={pausePlayback}
        resumePlayback={resumePlayback}
        playNextStation={playNextStation}
        playPreviousStation={playPreviousStation}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    </View>
  );
}
