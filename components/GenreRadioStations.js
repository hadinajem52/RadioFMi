import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  Modal, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const GenreRadioStations = ({ 
  visible, 
  onClose, 
  genreId, 
  radioStations, 
  currentStation, 
  isPlaying, 
  playStation, 
  togglePlayPause,
  styles 
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const getGenreInfo = (id) => {
    switch (id) {
      case 'news':
        return { 
          name: getLocalizedString('newsAndTalk', language), 
          icon: 'newspaper-outline',
          description: getLocalizedString('newsDescription', language)
        };
      case 'music':
        return { 
          name: getLocalizedString('musicAndEntertainment', language), 
          icon: 'musical-notes-outline',
          description: getLocalizedString('musicDescription', language)
        };
      case 'religious':
        return { 
          name: getLocalizedString('religious', language), 
          icon: 'heart-outline',
          description: getLocalizedString('religiousDescription', language)
        };
      default:
        return { 
          name: getLocalizedString('lebaneseRadioStations', language), 
          icon: 'radio-outline', 
          description: '' 
        };
    }
  };

  const filterStationsByGenre = (stations, genre) => {
    if (!genre) return stations;
    
    return stations.filter(station => {
      if (!station.genre) return false;
      
      // Handle both string and array genres
      if (Array.isArray(station.genre)) {
        return station.genre.some(g => {
          switch (genre) {
            case 'news':
              return g.toLowerCase().includes('news') || g.toLowerCase().includes('talk');
            case 'music':
              return g.toLowerCase().includes('music') || g.toLowerCase().includes('entertainment');
            case 'religious':
              return g.toLowerCase().includes('religious');
            default:
              return false;
          }
        });
      } else {
        const genreLower = station.genre.toLowerCase();
        switch (genre) {
          case 'news':
            return genreLower.includes('news') || genreLower.includes('talk');
          case 'music':
            return genreLower.includes('music') || genreLower.includes('entertainment');
          case 'religious':
            return genreLower.includes('religious');
          default:
            return false;
        }
      }
    });
  };

  const genreInfo = getGenreInfo(genreId);
  const filteredStations = filterStationsByGenre(radioStations, genreId);

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
          styles.genreStationItem,
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
            {isRTL ? (station.nameAr || station.name) : station.name}
          </Text>
          <Text style={[
            styles.stationDescription,
            isRTL && { textAlign: 'right' }
          ]}>
            {isRTL ? (station.descriptionAr || station.description) : station.description}
          </Text>

        </View>
        <TouchableOpacity
          style={[styles.genrePlayButton, isRTL && styles.rtlGenrePlayButton]}
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.genreContainer, isRTL && styles.rtlGenreContainer]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.genreHeader, isRTL && styles.rtlGenreHeader]}>
          <TouchableOpacity
            style={styles.genreBackButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={[styles.genreHeaderContent, isRTL && styles.rtlGenreHeaderContent]}>
            <Ionicons 
              name={genreInfo.icon} 
              size={20} 
              color="#666" 
              style={[styles.genreHeaderIcon, isRTL && styles.rtlGenreHeaderIcon]}
            />
            <Text style={[styles.genreHeaderTitle, isRTL && styles.rtlGenreHeaderTitle]}>
              {genreInfo.name}
            </Text>
          </View>
          
          <View style={{ width: 24 }} />
        </View>

        {/* Genre Description */}
        {genreInfo.description && (
          <View style={[styles.genreDescriptionContainer, isRTL && styles.rtlGenreDescriptionContainer]}>
            <Text style={[styles.genreDescription, isRTL && styles.rtlGenreDescription]}>
              {genreInfo.description}
            </Text>
          </View>
        )}

        {/* Stations Count */}
        <View style={[styles.genreStationsCount, isRTL && styles.rtlGenreStationsCount]}>
          <Text style={[styles.genreStationsCountText, isRTL && styles.rtlGenreStationsCountText]}>
            {filteredStations.length} {filteredStations.length !== 1 ? getLocalizedString('stations', language) : getLocalizedString('station', language)} {getLocalizedString('stationsAvailable', language)}
          </Text>
        </View>

        {/* Stations List */}
        <FlatList
          data={filteredStations}
          renderItem={renderStationItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.genreStationsList, isRTL && styles.rtlGenreStationsList]}
          ListEmptyComponent={
            <View style={[styles.noStationsContainer, isRTL && styles.rtlNoStationsContainer]}>
              <Ionicons name="radio-outline" size={48} color="#ccc" />
              <Text style={[styles.noStationsText, isRTL && styles.rtlNoStationsText]}>
                {getLocalizedString('noStations', language)}
              </Text>
              <Text style={[styles.noStationsSubtext, isRTL && styles.rtlNoStationsSubtext]}>
                {getLocalizedString('noStationsSubtext', language)}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

export default GenreRadioStations;
