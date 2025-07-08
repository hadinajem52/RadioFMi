import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  FlatList, 
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
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
  
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

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



  useEffect(() => {
    return () => {
      // Cleanup is handled automatically by expo-audio
    };
  }, [player]);

  const playStation = async (station) => {
    try {
      setIsLoading(true);
      setCurrentStation(station);
      
      // Replace the current source and play
      await player.replace(station.url);
      await player.play();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing station:', error);
      Alert.alert('Error', 'Failed to play radio station');
      setIsLoading(false);
    }
  };

  const pausePlayback = () => {
    try {
      player.pause();
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const resumePlayback = async () => {
    try {
      if (currentStation) {
        await player.play();
      }
    } catch (error) {
      console.error('Error resuming playback:', error);
      // If resume fails, try to play the station again
      if (currentStation) {
        playStation(currentStation);
      }
    }
  };

  const stopPlayback = () => {
    try {
      player.pause();
      setCurrentStation(null);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const isPlaying = status.isPlaying || false;

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

  const playNextStation = () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex(s => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    playStation(radioStations[nextIndex]);
  };

  const playPreviousStation = () => {
    if (!currentStation) return;
    const currentIndex = radioStations.findIndex(s => s.id === currentStation.id);
    const prevIndex = currentIndex === 0 ? radioStations.length - 1 : currentIndex - 1;
    playStation(radioStations[prevIndex]);
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
