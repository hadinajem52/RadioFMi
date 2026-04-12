import React, { useCallback, useMemo } from 'react';
import { FlatList, Image, Modal, StatusBar, Text, TouchableOpacity, View } from 'react-native';
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
  styles,
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const genreInfo = useMemo(() => {
    switch (genreId) {
      case 'news':
        return {
          name: getLocalizedString('newsAndTalk', language),
          icon: 'newspaper-outline',
          description: getLocalizedString('newsDescription', language),
        };
      case 'music':
        return {
          name: getLocalizedString('musicAndEntertainment', language),
          icon: 'musical-notes-outline',
          description: getLocalizedString('musicDescription', language),
        };
      case 'religious':
        return {
          name: getLocalizedString('religious', language),
          icon: 'heart-outline',
          description: getLocalizedString('religiousDescription', language),
        };
      default:
        return {
          name: getLocalizedString('lebaneseRadioStations', language),
          icon: 'radio-outline',
          description: '',
        };
    }
  }, [genreId, language]);

  const filteredStations = useMemo(() => {
    if (!genreId) {
      return radioStations;
    }

    return radioStations.filter((station) => {
      if (!station.genre) return false;

      const genreValues = Array.isArray(station.genre) ? station.genre : [station.genre];
      return genreValues.some((genreValue) => {
        const normalizedGenre = String(genreValue).toLowerCase();
        switch (genreId) {
          case 'news':
            return normalizedGenre.includes('news') || normalizedGenre.includes('talk');
          case 'music':
            return normalizedGenre.includes('music') || normalizedGenre.includes('entertainment');
          case 'religious':
            return normalizedGenre.includes('religious');
          default:
            return false;
        }
      });
    });
  }, [genreId, radioStations]);

  const handleStationPress = useCallback(
    (station) => {
      if (currentStation?.id === station.id) {
        togglePlayPause();
      } else {
        playStation(station);
      }
    },
    [currentStation?.id, playStation, togglePlayPause]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const renderStationItem = useCallback(
    ({ item: station }) => {
      const isCurrentStation = currentStation?.id === station.id;
      const shouldShowPause = isCurrentStation && isPlaying;

      return (
        <TouchableOpacity
          style={[
            styles.stationRow,
            styles.genreStationItem,
            isRTL && {
              flexDirection: 'row-reverse',
            },
          ]}
          onPress={() => handleStationPress(station)}
        >
          <Image
            source={station.image}
            style={[
              styles.stationIcon,
              isRTL && {
                marginRight: 0,
                marginLeft: 15,
              },
            ]}
            resizeMode="cover"
          />
          <View style={[styles.stationInfo, isRTL && styles.rtlStationInfo]}>
            <Text
              style={[
                styles.stationName,
                isCurrentStation && styles.currentStationText,
                isRTL && { textAlign: 'right' },
              ]}
            >
              {isRTL ? station.nameAr || station.name : station.name}
            </Text>
            <Text style={[styles.stationDescription, isRTL && { textAlign: 'right' }]}>
              {isRTL ? station.descriptionAr || station.description : station.description}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.genrePlayButton, isRTL && styles.rtlGenrePlayButton]}
            onPress={() => handleStationPress(station)}
          >
            <Ionicons name={shouldShowPause ? 'pause' : 'play'} size={20} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [currentStation?.id, handleStationPress, isPlaying, isRTL, styles]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.genreContainer, isRTL && styles.rtlGenreContainer]}>
        <StatusBar barStyle="dark-content" />

        <View style={[styles.genreHeader, isRTL && styles.rtlGenreHeader]}>
          <TouchableOpacity style={styles.genreBackButton} onPress={onClose}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={[styles.genreHeaderContent, isRTL && styles.rtlGenreHeaderContent]}>
            <Ionicons
              name={genreInfo.icon}
              size={20}
              color="#ffffff"
              style={[styles.genreHeaderIcon, isRTL && styles.rtlGenreHeaderIcon]}
            />
            <Text style={[styles.genreHeaderTitle, isRTL && styles.rtlGenreHeaderTitle]}>{genreInfo.name}</Text>
          </View>

          <View style={{ width: 24 }} />
        </View>

        {genreInfo.description && (
          <View style={[styles.genreDescriptionContainer, isRTL && styles.rtlGenreDescriptionContainer]}>
            <Text style={[styles.genreDescription, isRTL && styles.rtlGenreDescription]}>{genreInfo.description}</Text>
          </View>
        )}

        <View style={[styles.genreStationsCount, isRTL && styles.rtlGenreStationsCount]}>
          <Text style={[styles.genreStationsCountText, isRTL && styles.rtlGenreStationsCountText]}>
            {filteredStations.length}{' '}
            {filteredStations.length !== 1
              ? getLocalizedString('stations', language)
              : getLocalizedString('station', language)}{' '}
            {getLocalizedString('stationsAvailable', language)}
          </Text>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={filteredStations}
          renderItem={renderStationItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.genreStationsList, isRTL && styles.rtlGenreStationsList]}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={9}
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

export default React.memo(GenreRadioStations);
