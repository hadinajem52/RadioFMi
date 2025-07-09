import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  if (!currentStation) return null;

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
          flexDirection: 'row',
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
          }}>
            Now Playing
          </Text>
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
          }}>
            {currentStation.name}
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 30,
          }}>
            {currentStation.description}
          </Text>

          {/* Live indicator */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            marginBottom: 40,
          }}>
            <View style={{
              width: 8,
              height: 8,
              backgroundColor: '#ff4444',
              borderRadius: 4,
              marginRight: 8,
            }} />
            <Text style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: '500',
            }}>
              LIVE
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={{
          paddingHorizontal: 40,
          paddingBottom: 50,
        }}>
          {/* Main Controls */}
          <View style={{
            flexDirection: 'row',
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
                marginRight: 30,
              }}
            >
              <Ionicons name="play-skip-back" size={24} color="#fff" />
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
                marginLeft: 30,
              }}
            >
              <Ionicons name="play-skip-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Volume Control */}
          {volume !== undefined && setVolume && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
              <TouchableOpacity onPress={() => setVolume(Math.max(0, volume - 0.1))}>
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
                  const { locationX, width } = e.nativeEvent;
                  const newVolume = locationX / width;
                  setVolume(Math.max(0, Math.min(1, newVolume)));
                }}
              >
                <View style={{
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 2,
                }}>
                  <View style={{
                    width: `${volume * 100}%`,
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVolume(Math.min(1, volume + 0.1))}>
                <Ionicons name="volume-high" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
};

export default FullscreenPlayer;
