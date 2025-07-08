import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomPlayer = ({ styles, currentStation, isPlaying, isLoading, pausePlayback, resumePlayback }) => (
  <View style={styles.bottomPlayer}>
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
      style={styles.playButton}
      onPress={() => {
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
  </View>
);

export default BottomPlayer;
