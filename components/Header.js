import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const Header = ({ styles, onSearchPress, onMenuPress }) => {
  const { language } = useLanguage();
  
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getLocalizedString('appTitle', language)}</Text>
        <TouchableOpacity onPress={onSearchPress} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
