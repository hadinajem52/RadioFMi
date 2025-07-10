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
  const getGenreInfo = (id) => {
    switch (id) {
      case 'news':
        return { 
          name: 'News & Talk', 
          icon: 'newspaper-outline',
          description: 'Stay informed with news and talk shows'
        };
      case 'music':
        return { 
          name: 'Music & Entertainment', 
          icon: 'musical-notes-outline',
          description: 'Enjoy music and entertainment'
        };
      case 'religious':
        return { 
          name: 'Religious', 
          icon: 'heart-outline',
          description: 'Spiritual and religious content'
        };
      default:
        return { name: 'Radio Stations', icon: 'radio-outline', description: '' };
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
        style={[styles.stationRow, styles.genreStationItem]}
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
            {station.name}
          </Text>
          <Text style={styles.stationDescription}>{station.description}</Text>
          {station.genre && (
            <Text style={styles.stationGenre}>
              {Array.isArray(station.genre) ? station.genre.join(', ') : station.genre}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.genrePlayButton}
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
      <View style={styles.genreContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.genreHeader}>
          <TouchableOpacity
            style={styles.genreBackButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.genreHeaderContent}>
            <Ionicons 
              name={genreInfo.icon} 
              size={20} 
              color="#666" 
              style={styles.genreHeaderIcon}
            />
            <Text style={styles.genreHeaderTitle}>{genreInfo.name}</Text>
          </View>
          
          <View style={{ width: 24 }} />
        </View>

        {/* Genre Description */}
        {genreInfo.description && (
          <View style={styles.genreDescriptionContainer}>
            <Text style={styles.genreDescription}>{genreInfo.description}</Text>
          </View>
        )}

        {/* Stations Count */}
        <View style={styles.genreStationsCount}>
          <Text style={styles.genreStationsCountText}>
            {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {/* Stations List */}
        <FlatList
          data={filteredStations}
          renderItem={renderStationItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.genreStationsList}
          ListEmptyComponent={
            <View style={styles.noStationsContainer}>
              <Ionicons name="radio-outline" size={48} color="#ccc" />
              <Text style={styles.noStationsText}>No stations found</Text>
              <Text style={styles.noStationsSubtext}>
                No stations available for this genre
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

export default GenreRadioStations;
