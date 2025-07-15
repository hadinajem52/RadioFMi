import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const SearchModal = ({
  visible,
  onClose,
  radioStations,
  currentStation,
  isPlaying,
  playStation,
  togglePlayPause,
  styles
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStations(radioStations);
    } else {
      const filtered = radioStations.filter(station => {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = station.name?.toLowerCase().includes(searchLower);
        const nameArMatch = station.nameAr?.toLowerCase().includes(searchLower);
        const descMatch = station.description?.toLowerCase().includes(searchLower);
        const descArMatch = station.descriptionAr?.toLowerCase().includes(searchLower);
        
        // Handle genre as both string and array
        let genreMatch = false;
        if (station.genre) {
          if (Array.isArray(station.genre)) {
            genreMatch = station.genre.some(g => g.toLowerCase().includes(searchLower));
          } else {
            genreMatch = station.genre.toLowerCase().includes(searchLower);
          }
        }
        
        return nameMatch || nameArMatch || descMatch || descArMatch || genreMatch;
      });
      setFilteredStations(filtered);
    }
  }, [searchQuery, radioStations]);

  const handleStationPress = (station) => {
    if (currentStation && currentStation.id === station.id) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  const renderStationItem = ({ item: station }) => {
    const isCurrentStation = currentStation && currentStation.id === station.id;
    const shouldShowPause = isCurrentStation && isPlaying;

    return (
      <TouchableOpacity
        style={[styles.stationRow, styles.searchResultItem]}
        onPress={() => handleStationPress(station)}
      >
        <Image
          source={station.image}
          style={styles.stationIcon}
          resizeMode="cover"
        />
        <View style={styles.stationInfo}>
          <Text style={[
            styles.stationName,
            isCurrentStation && styles.currentStationText
          ]}>
            {language === 'ar' ? station.nameAr || station.name : station.name}
          </Text>
          <Text style={styles.stationDescription}>
            {language === 'ar' ? station.descriptionAr || station.description : station.description}
          </Text>
          {station.genre && (
            <Text style={styles.stationGenre}>
              {Array.isArray(station.genre) ? station.genre.join(', ') : station.genre}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchPlayButton}
          onPress={() => handleStationPress(station)}
        >
          <Ionicons
            name={shouldShowPause ? 'pause' : 'play'}
            size={20}
            color={isCurrentStation ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.searchContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <TouchableOpacity
            style={styles.searchBackButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={getLocalizedString('searchPlaceholder', language)}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <View style={styles.searchResults}>
          {searchQuery.trim() !== '' && (
            <Text style={styles.searchResultsCount}>
              {filteredStations.length} {getLocalizedString('searchResultsCount', language)}
            </Text>
          )}
          
          <FlatList
            data={filteredStations}
            renderItem={renderStationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchResultsList}
            ListEmptyComponent={
              searchQuery.trim() !== '' && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="radio-outline" size={48} color="#ccc" />
                  <Text style={styles.noResultsText}>{getLocalizedString('noResults', language)}</Text>
                  <Text style={styles.noResultsSubtext}>
                    {getLocalizedString('noResultsSubtext', language)}
                  </Text>
                </View>
              )
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default SearchModal;
