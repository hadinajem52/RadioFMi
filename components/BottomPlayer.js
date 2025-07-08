import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomPlayer = ({ styles, currentStation, isPlaying, isLoading, pausePlayback, resumePlayback, onPress, favorites, toggleFavorite }) => (
  <TouchableOpacity style={styles.bottomPlayer} onPress={onPress} activeOpacity={0.8}>
    <Image 
      source={currentStation.image} 
      style={styles.playerIcon}
      resizeMode="contain"
    />
    <View style={styles.playerInfo}>
      <Text style={styles.playerStationName}>{currentStation.name}</Text>
      <Text style={styles.playerDescription}>Live Radio</Text>
    </View>
    <TouchableOpacity
      style={styles.favoriteButton}
      onPress={(e) => {
        e.stopPropagation();
        toggleFavorite(currentStation);
      }}
    >
      <Ionicons 
        name={favorites.some(fav => fav.id === currentStation.id) ? "heart" : "heart-outline"} 
        size={20} 
        color={favorites.some(fav => fav.id === currentStation.id) ? "#ff4444" : "#fff"} 
      />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.playButton}
      onPress={(e) => {
        e.stopPropagation(); // Prevent triggering the parent onPress
        if (isPlaying) {
          pausePlayback();
        } else if (currentStation) {
          resumePlayback();
        }
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color="#fff" 
        />
      )}
    </TouchableOpacity>
  </TouchableOpacity>
);

export default BottomPlayer;
