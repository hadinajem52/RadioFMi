import React from 'react';
import { View, Text } from 'react-native';

const YourShows = ({ styles }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Your Shows</Text>
    <View style={styles.showsContainer}>
      <View style={styles.showCard}>
        <View style={styles.showImage} />
        <Text style={styles.showName}>Show Name</Text>
      </View>
      <View style={styles.showCard}>
        <View style={styles.showImage} />
        <Text style={styles.showName}>Show Name</Text>
      </View>
    </View>
  </View>
);

export default YourShows;
