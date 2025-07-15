import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const LebaneseRadioStations = ({ styles, radioStations, currentStation, isPlaying, playStation, togglePlayPause, language }) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = language || contextLanguage;
  const isRTL = activeLanguage === 'ar';
  
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
        {getLocalizedString('lebaneseRadioStations', activeLanguage)}
      </Text>
      {radioStations.map((station) => (
        <TouchableOpacity
          key={station.id}
          style={[
            styles.stationRow,
            isRTL && { 
              flexDirection: 'row-reverse',
            }
          ]}
          onPress={() => {
            if (currentStation?.id === station.id) {
              togglePlayPause();
            } else {
              playStation(station);
            }
          }}
        >
          <Image 
            source={station.image} 
            style={[
              styles.stationIcon,
              isRTL && { 
                marginRight: 0,
                marginLeft: 15,
              }
            ]}
            resizeMode="contain"
          />
          <View style={styles.stationInfo}>
            <Text style={[
              styles.stationName,
              isRTL && { textAlign: 'right' }
            ]}>
              {activeLanguage === 'ar' ? station.nameAr || station.name : station.name}
            </Text>
            <Text style={[
              styles.stationDescription,
              isRTL && { textAlign: 'right' }
            ]}>
              {getLocalizedString('liveRadio', activeLanguage)}
            </Text>
          </View>
          <Ionicons 
            name={isRTL ? "chevron-back" : "chevron-forward"} 
            size={20} 
            color="#ccc" 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LebaneseRadioStations;
