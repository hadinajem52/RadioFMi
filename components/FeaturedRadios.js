import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const FeaturedRadios = ({ styles, radioStations, playStation, currentStation, isPlaying, togglePlayPause }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Get the featured radio stations: Al Nour, Virgin Radio, Sawt El Ghad, Virgin Radio Stars
  const featuredStations = radioStations.filter(station => 
    station.id === 30 || // Al Nour
    station.id === 5 ||  // Virgin Radio
    station.id === 4 ||  // Sawt El Ghad
    station.id === 18    // Virgin Radio Stars
  ).sort((a, b) => {
    // In RTL mode, we want Al Nour to appear on the right (which is the end of the array)
    // In LTR mode, we want Al Nour to appear on the left (which is the beginning of the array)
    if (isRTL) {
      return a.id === 30 ? 1 : b.id === 30 ? -1 : 0;
    } else {
      return a.id === 30 ? -1 : b.id === 30 ? 1 : 0;
    }
  });

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
        {getLocalizedString('featuredRadios', language)}
      </Text>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.showsContainer, isRTL && styles.rtlShowsContainer]}
        style={isRTL && { transform: [{ scaleX: -1 }] }}
      >
        {featuredStations.map((station) => (
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
    </View>
  );
};

export default FeaturedRadios;
