import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ styles, onSearchPress }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Ionicons name="menu" size={24} color="#666" />
      <Text style={styles.headerTitle}>Radio FM</Text>
      <TouchableOpacity onPress={onSearchPress} style={styles.searchButton}>
        <Ionicons name="search" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
);

export default Header;
