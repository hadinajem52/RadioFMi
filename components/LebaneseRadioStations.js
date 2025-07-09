import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StreamHealthIndicator from './StreamHealthIndicator';

const LebaneseRadioStations = ({ styles, radioStations, currentStation, isPlaying, playStation, togglePlayPause }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Lebanese Radio Stations</Text>
    {radioStations.map((station) => (
      <TouchableOpacity
        key={station.id}
        style={styles.stationRow}
        onPress={() => {
          if (currentStation?.id === station.id) {
            togglePlayPause();
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.stationDescription}>Live Radio</Text>
            <StreamHealthIndicator 
              station={station} 
              size={12}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    ))}
  </View>
);

export default LebaneseRadioStations;
