import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const Favorites = ({ styles, favorites, currentStation, isPlaying, playStation, togglePlayPause, language }) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = language || contextLanguage;
  const isRTL = activeLanguage === 'ar';

  // Pulsing Glow Component
  const PulsingGlow = ({ children, isActive }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      if (isActive) {
        // Start pulsing animation
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        );

        // Start glow animation
        const glowAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 0.8,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );

        pulseAnimation.start();
        glowAnimation.start();

        return () => {
          pulseAnimation.stop();
          glowAnimation.stop();
        };
      } else {
        // Reset animations when not active
        pulseAnim.setValue(1);
        glowAnim.setValue(0.3);
      }
    }, [isActive, pulseAnim, glowAnim]);

    return (
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          position: 'relative',
        }}
      >
        {/* Outer glow ring */}
        {isActive && (
          <Animated.View
            style={{
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: 20,
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: '#7C4DFF',
              opacity: glowAnim,
              shadowColor: '#7C4DFF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 15,
              elevation: 8,
            }}
          />
        )}
        {children}
      </Animated.View>
    );
  };

  const handleStationPress = (station) => {
    if (currentStation?.id === station.id) {
      // If this station is currently selected
      togglePlayPause();
    } else {
      // Play new station
      playStation(station);
    }
  };

  const getStationName = (station) => {
    return isRTL ? (station.nameAr || station.name) : station.name;
  };

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

export default Favorites;
