import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ styles }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Ionicons name="menu" size={24} color="#666" />
      <Text style={styles.headerTitle}>Radio FM</Text>
      <Ionicons name="search" size={24} color="#666" />
    </View>
  </View>
);

export default Header;
