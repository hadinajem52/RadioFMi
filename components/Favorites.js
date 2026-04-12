import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';
import PulsingGlow from './PulsingGlow';

const Favorites = ({ styles, favorites, currentStation, isPlaying, playStation, togglePlayPause }) => {
  const { language } = useLanguage();
  const activeLanguage = language;
  const isRTL = activeLanguage === 'ar';

  const handleStationPress = useCallback((station) => {
    if (currentStation?.id === station.id) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  }, [currentStation?.id, playStation, togglePlayPause]);

  const getStationName = useCallback(
    (station) => (isRTL ? (station.nameAr || station.name) : station.name),
    [isRTL]
  );

  return (
    <View style={[styles.section, isRTL && styles.rtlSection]}>
      <View style={[styles.sectionTitleContainer, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlSectionTitle]}>
          {getLocalizedString('favorites', language)}
        </Text>
      </View>
      {favorites.length === 0 ? (
        <View style={[styles.noFavoritesContainer, isRTL && styles.rtlNoFavoritesContainer]}>
          <Text style={[styles.noFavoritesText, isRTL && styles.rtlNoFavoritesText]}>
            {getLocalizedString('noFavorites', language)}
          </Text>
          <Text style={[styles.noFavoritesSubtext, isRTL && styles.rtlNoFavoritesSubtext]}>
            {getLocalizedString('noFavoritesSubtext', language)}
          </Text>
        </View>
      ) : (
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.showsContainer, isRTL && styles.rtlShowsContainer]}
          style={isRTL && { transform: [{ scaleX: -1 }] }}
        >
          {favorites.map((station) => (
            <TouchableOpacity 
              key={station.id}
              style={[
                styles.showCard, 
                isRTL && styles.rtlShowCard,
                isRTL && { transform: [{ scaleX: -1 }] }
              ]}
              onPress={() => handleStationPress(station)}
            >
              <PulsingGlow isActive={currentStation?.id === station.id && isPlaying}>
                <View style={[styles.showImage]}>
                  <Image source={station.image} style={styles.showImage} resizeMode="cover" />
                  {/* Enhanced play/pause overlay */}
                  {currentStation?.id === station.id && (
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 12,
                    }}>
                      <View style={{
                        backgroundColor: 'rgba(124, 77, 255, 0.9)',
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#7C4DFF',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 8,
                        elevation: 4,
                      }}>
                        <Ionicons 
                          name={isPlaying ? 'pause' : 'play'} 
                          size={20} 
                          color="#ffffff" 
                          style={{ marginLeft: isPlaying ? 0 : 2 }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </PulsingGlow>
              <Text style={[styles.showName, isRTL && styles.rtlShowName]} numberOfLines={1}>
                {getStationName(station)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default React.memo(Favorites);
