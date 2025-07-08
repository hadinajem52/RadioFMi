import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';

const FeaturedRadios = ({ styles, radioStations, playStation, currentStation, isPlaying, pausePlayback, resumePlayback }) => {
  // Get the featured radio stations: Al Nour, Virgin Radio, Sawt El Ghad, Virgin Radio Stars
  const featuredStations = radioStations.filter(station => 
    station.id === 30 || // Al Nour
    station.id === 5 ||  // Virgin Radio
    station.id === 4 ||  // Sawt El Ghad
    station.id === 18    // Virgin Radio Stars
  ).sort((a, b) => a.id === 30 ? -1 : b.id === 30 ? 1 : 0);

  const handleStationPress = (station) => {
    if (currentStation?.id === station.id) {
      // If this station is currently selected
      if (isPlaying) {
        pausePlayback();
      } else {
        resumePlayback();
      }
    } else {
      // Play new station
      playStation(station);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Featured Radios</Text>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.showsContainer}
      >
        {featuredStations.map((station) => (
          <TouchableOpacity 
            key={station.id}
            style={styles.showCard}
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
            <Text style={styles.showName} numberOfLines={1}>
              {station.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FeaturedRadios;
