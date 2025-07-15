import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StreamStatus from './StreamStatus';
import { useLanguage } from '../contexts/LanguageContext';

const BottomPlayer = ({ styles, currentStation, isPlaying, isLoading, togglePlayPause, onPress, favorites, toggleFavorite }) => {
  const { language } = useLanguage();

  return (
    <TouchableOpacity style={styles.bottomPlayer} onPress={onPress} activeOpacity={0.8}>
      <Image 
        source={currentStation.image} 
        style={styles.playerIcon}
        resizeMode="contain"
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerStationName}>
          {language === 'ar' ? currentStation.nameAr || currentStation.name : currentStation.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <StreamStatus 
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            size="small"
            showText={true}
            textColor="#rgba(255,255,255,0.8)"
            iconColor="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.playerDescription}>Live Radio</Text>
        </View>
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
          togglePlayPause();
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
};

export default BottomPlayer;
