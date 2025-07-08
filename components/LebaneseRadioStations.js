import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LebaneseRadioStations = ({ styles, radioStations, currentStation, isPlaying, playStation, pausePlayback, resumePlayback }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Lebanese Radio Stations</Text>
    {radioStations.map((station) => (
      <TouchableOpacity
        key={station.id}
        style={styles.stationRow}
        onPress={() => {
          if (currentStation?.id === station.id && isPlaying) {
            pausePlayback();
          } else if (currentStation?.id === station.id && !isPlaying) {
            resumePlayback();
          } else {
            playStation(station);
          }
        }}
      >
        <Image 
          source={station.image} 
          style={styles.stationIcon}
          resizeMode="contain"
        />
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.stationDescription}>Live Radio</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    ))}
  </View>
);

export default LebaneseRadioStations;
