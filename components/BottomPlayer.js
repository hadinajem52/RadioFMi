import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StreamStatus from './StreamStatus';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const BottomPlayer = ({ styles, currentStation, isPlaying, isLoading, togglePlayPause, onPress, favorites, toggleFavorite }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const getStationName = (station) => {
    return isRTL ? (station.nameAr || station.name) : station.name;
  };

  return (
    <TouchableOpacity 
      style={[styles.bottomPlayer, {
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Image 
        source={currentStation.image} 
        style={styles.playerIcon}
        resizeMode="contain"
      />
      <View style={[styles.playerInfo, {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }]}>
        <Text style={[styles.playerStationName, {
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        }]}>
          {getStationName(currentStation)}
        </Text>
        <View style={{ 
          flexDirection: isRTL ? 'row-reverse' : 'row', 
          alignItems: 'center', 
          marginTop: 2,
        }}>
          <StreamStatus 
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            size="small"
            showText={true}
            textColor="#rgba(255,255,255,0.8)"
            iconColor="#fff"
            style={{ 
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0 
            }}
          />
          <Text style={[styles.playerDescription, {
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }]}>
            {getLocalizedString('liveRadio', language)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.favoriteButton, {
          marginRight: isRTL ? 0 : 10,
          marginLeft: isRTL ? 10 : 0,
        }]}
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
