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
  const isRTL = language === 'ar';

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
        
        
        return nameMatch || nameArMatch || descMatch || descArMatch;
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
        style={[
          styles.stationRow, 
          styles.searchResultItem,
          isRTL && {
            flexDirection: 'row-reverse'
          }
        ]}
        onPress={() => handleStationPress(station)}
      >
        <Image
          source={station.image}
          style={[
            styles.stationIcon,
            isRTL && {
              marginRight: 0,
              marginLeft: 15
            }
          ]}
          resizeMode="cover"
        />
        <View style={[styles.stationInfo, isRTL && styles.rtlStationInfo]}>
          <Text style={[
            styles.stationName,
            isCurrentStation && styles.currentStationText,
            isRTL && { textAlign: 'right' }
          ]}>
            {language === 'ar' ? station.nameAr || station.name : station.name}
          </Text>
          <Text style={[
            styles.stationDescription,
            isRTL && { textAlign: 'right' }
          ]}>
            {language === 'ar' ? station.descriptionAr || station.description : station.description}
          </Text>

        </View>
        <TouchableOpacity
          style={[styles.searchPlayButton, isRTL && styles.rtlSearchPlayButton]}
          onPress={() => handleStationPress(station)}
        >
          <Ionicons
            name={shouldShowPause ? 'pause' : 'play'}
            size={20}
            color="#ffffff"
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
      <View style={[styles.searchContainer, isRTL && styles.rtlSearchContainer]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Search Header */}
        <View style={[styles.searchHeader, isRTL && styles.rtlSearchHeader]}>
          <TouchableOpacity
            style={[styles.searchBackButton, isRTL && styles.rtlSearchBackButton]}
            onPress={onClose}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={[styles.searchInputContainer, isRTL && styles.rtlSearchInputContainer]}>
            <Ionicons 
              name="search" 
              size={20} 
              color="#ffffff" 
              style={[styles.searchIcon, isRTL && styles.rtlSearchIcon]} 
            />
            <TextInput
              style={[styles.searchInput, isRTL && styles.rtlSearchInput]}
              placeholder={getLocalizedString('searchPlaceholder', language)}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              placeholderTextColor="#999"
              textAlign={isRTL ? 'right' : 'left'}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, isRTL && styles.rtlClearButton]}
                onPress={clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <View style={[styles.searchResults, isRTL && styles.rtlSearchResults]}>
          {searchQuery.trim() !== '' && (
            <Text style={[styles.searchResultsCount, isRTL && styles.rtlSearchResultsCount]}>
              {filteredStations.length} {getLocalizedString('searchResultsCount', language)}
            </Text>
          )}
          
          <FlatList
            data={filteredStations}
            renderItem={renderStationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.searchResultsList, isRTL && styles.rtlSearchResultsList]}
            ListEmptyComponent={
              searchQuery.trim() !== '' && (
                <View style={[styles.noResultsContainer, isRTL && styles.rtlNoResultsContainer]}>
                  <Ionicons name="radio-outline" size={48} color="#ccc" />
                  <Text style={[styles.noResultsText, isRTL && styles.rtlNoResultsText]}>
                    {getLocalizedString('noResults', language)}
                  </Text>
                  <Text style={[styles.noResultsSubtext, isRTL && styles.rtlNoResultsSubtext]}>
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
