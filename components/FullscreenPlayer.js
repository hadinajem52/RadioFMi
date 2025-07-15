import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';
import StreamStatus from './StreamStatus';
import StreamMonitor from './StreamMonitor';

const { width, height } = Dimensions.get('window');

const FullscreenPlayer = ({ 
  visible, 
  onClose, 
  currentStation, 
  isPlaying, 
  isLoading, 
  togglePlayPause,
  playNextStation,
  playPreviousStation,
  volume,
  setVolume,
  favorites,
  toggleFavorite
}) => {
  const [showStreamMonitor, setShowStreamMonitor] = useState(false);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  if (!currentStation) return null;

  const getStationName = (station) => {
    return isRTL ? (station.nameAr || station.name) : station.name;
  };

  const getStationDescription = (station) => {
    return isRTL ? (station.descriptionAr || station.description) : station.description;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={currentStation.color || ['#333', '#666']}
        style={{
          flex: 1,
          paddingTop: 50,
        }}
      >
        {/* Header with close button */}
        <View style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 15,
        }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}>
            {getLocalizedString('nowPlaying', language)}
          </Text>
          <View style={{ 
            flexDirection: isRTL ? 'row-reverse' : 'row', 
            alignItems: 'center' 
          }}>
            <TouchableOpacity
              onPress={() => setShowStreamMonitor(true)}
              style={{ 
                marginRight: isRTL ? 0 : 15,
                marginLeft: isRTL ? 15 : 0 
              }}
            >
              <Ionicons name="analytics" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleFavorite(currentStation)}
            >
              <Ionicons 
                name={favorites?.some(fav => fav.id === currentStation.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={favorites?.some(fav => fav.id === currentStation.id) ? "#ff4444" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Station Image */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}>
          <View style={{
            width: width * 0.7,
            height: width * 0.7,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Image 
              source={currentStation.image} 
              style={{
                width: '80%',
                height: '80%',
                borderRadius: 15,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Station Info */}
          <Text style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}>
            {getStationName(currentStation)}
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 20,
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}>
            {getStationDescription(currentStation)}
          </Text>

          {/* Enhanced Stream Status */}
          <View style={{
            alignItems: 'center',
            marginBottom: 30,
          }}>
            <StreamStatus 
              currentStation={currentStation}
              isPlaying={isPlaying}
              isLoading={isLoading}
              size="large"
              showText={true}
              textColor="#fff"
              iconColor="#fff"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                minWidth: 120,
                justifyContent: 'center',
              }}
            />
          </View>

          {/* Connection Quality Indicator */}
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <View style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
            }}>
              <Ionicons name="wifi" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 12,
                marginLeft: isRTL ? 0 : 4,
                marginRight: isRTL ? 4 : 0,
                fontWeight: '500',
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}>
                {getLocalizedString('streamingQuality', language)}
              </Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={{
          paddingHorizontal: 40,
          paddingBottom: 50,
        }}>
          {/* Main Controls */}
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
          }}>
            <TouchableOpacity
              onPress={playPreviousStation}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: isRTL ? 0 : 30,
                marginLeft: isRTL ? 30 : 0,
              }}
            >
              <Ionicons name={isRTL ? "play-skip-forward" : "play-skip-back"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 30,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#333" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="#333" 
                  style={{ marginLeft: isPlaying ? 0 : 3 }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playNextStation}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: isRTL ? 0 : 30,
                marginRight: isRTL ? 30 : 0,
              }}
            >
              <Ionicons name={isRTL ? "play-skip-back" : "play-skip-forward"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Volume Control */}
          {volume !== undefined && setVolume && (
            <View style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
              <TouchableOpacity onPress={() => {
                const newVolume = Math.max(0, volume - 0.1);
                if (typeof newVolume === 'number' && !isNaN(newVolume)) {
                  setVolume(newVolume);
                }
              }}>
                <Ionicons name="volume-low" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  height: 40,
                  justifyContent: 'center',
                  marginHorizontal: 15,
                }}
                onPress={(e) => {
                  try {
                    const { locationX } = e.nativeEvent;
                    const { width } = e.currentTarget.measure ? e.currentTarget : { width: 200 };
                    const newVolume = Math.max(0, Math.min(1, locationX / (width || 200)));
                    if (typeof newVolume === 'number' && !isNaN(newVolume)) {
                      setVolume(newVolume);
                    }
                  } catch (error) {
                    console.warn('Error setting volume from touch:', error);
                  }
                }}
              >
                <View style={{
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 2,
                }}>
                  <View style={{
                    width: `${Math.max(0, Math.min(100, (volume || 0) * 100))}%`,
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                const newVolume = Math.min(1, volume + 0.1);
                if (typeof newVolume === 'number' && !isNaN(newVolume)) {
                  setVolume(newVolume);
                }
              }}>
                <Ionicons name="volume-high" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Stream Monitor Modal */}
      <StreamMonitor
        visible={showStreamMonitor}
        onClose={() => setShowStreamMonitor(false)}
        currentStation={currentStation}
      />
    </Modal>
  );
};

export default FullscreenPlayer;
