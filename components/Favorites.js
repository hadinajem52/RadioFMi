import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const Favorites = ({ styles, favorites, currentStation, isPlaying, playStation, togglePlayPause, language }) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = language || contextLanguage;
  const isRTL = activeLanguage === 'ar';

  const handleStationPress = (station) => {
    if (currentStation?.id === station.id) {
      // If this station is currently selected
      togglePlayPause();
    } else {
      // Play new station
      playStation(station);
    }
  };

  const getStationName = (station) => {
    return isRTL ? (station.nameAr || station.name) : station.name;
  };

  return (
    <View style={[styles.section, isRTL && styles.rtlSection]}>
      <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
        {getLocalizedString('favorites', language)}
      </Text>
      {favorites.length === 0 ? (
        <View style={[styles.noFavoritesContainer, isRTL && styles.rtlNoFavoritesContainer]}>
          <Text style={[styles.noFavoritesText, isRTL && styles.rtlNoFavoritesText]}>
            {getLocalizedString('noFavorites', language)}
          </Text>
          <Text style={[styles.noFavoritesSubtext, isRTL && styles.rtlNoFavoritesSubtext]}>
            {getLocalizedString('noFavoritesSubtext', language)}
          </Text>
        </View>
      ) : (
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.showsContainer, isRTL && styles.rtlShowsContainer]}
          style={isRTL && { transform: [{ scaleX: -1 }] }}
        >
          {favorites.map((station) => (
            <TouchableOpacity 
              key={station.id}
              style={[
                styles.showCard, 
                isRTL && styles.rtlShowCard,
                isRTL && { transform: [{ scaleX: -1 }] }
              ]}
              onPress={() => handleStationPress(station)}
            >
              <View style={[
                styles.showImage,
                currentStation?.id === station.id && isPlaying && {
                  borderWidth: 2,
                  borderColor: '#4ECDC4'
                }
              ]}>
                <Image source={station.image} style={styles.showImage} resizeMode="cover" />
              </View>
              <Text style={[styles.showName, isRTL && styles.rtlShowName]} numberOfLines={1}>
                {getStationName(station)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Favorites;
