import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const FeaturedRadios = ({ styles, radioStations, playStation, currentStation, isPlaying, togglePlayPause }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Get the featured radio stations: Al Nour, Virgin Radio, Sawt El Ghad, Virgin Radio Stars
  const featuredStations = radioStations.filter(station => 
    station.id === 30 || // Al Nour
    station.id === 5 ||  // Virgin Radio
    station.id === 21 ||  // nostalgie
    station.id === 4 ||  // Sawt El Ghad
    station.id === 18    // Virgin Radio Stars
  ).sort((a, b) => {
   
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
                borderColor: '#7C4DFF',
                shadowColor: '#7C4DFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 12,
                elevation: 6,
              }
            ]}>
              <Image source={station.image} style={styles.showImage} resizeMode="cover" />
              {/* Enhanced play/pause overlay */}
              {currentStation?.id === station.id && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                }}>
                  <View style={{
                    backgroundColor: 'rgba(124, 77, 255, 0.9)',
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#7C4DFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 4,
                  }}>
                    <Ionicons 
                      name={isPlaying ? 'pause' : 'play'} 
                      size={20} 
                      color="#ffffff" 
                      style={{ marginLeft: isPlaying ? 0 : 2 }}
                    />
                  </View>
                </View>
              )}
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
