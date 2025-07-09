import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';

const Favorites = ({ styles, favorites, currentStation, isPlaying, playStation, togglePlayPause }) => {
  const handleStationPress = (station) => {
    if (currentStation?.id === station.id) {
      // If this station is currently selected
      togglePlayPause();
    } else {
      // Play new station
      playStation(station);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Favorites</Text>
      {favorites.length === 0 ? (
        <View style={styles.noFavoritesContainer}>
          <Text style={styles.noFavoritesText}>No favorites yet</Text>
          <Text style={styles.noFavoritesSubtext}>Tap the heart icon to add stations to your favorites</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.showsContainer}
        >
          {favorites.map((station) => (
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
      )}
    </View>
  );
};

export default Favorites;
