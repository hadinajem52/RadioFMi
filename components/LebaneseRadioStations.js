import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';
import SortOptionsModal from './SortOptionsModal';

const LebaneseRadioStations = ({ 
  styles, 
  radioStations, 
  currentStation, 
  isPlaying, 
  playStation, 
  togglePlayPause, 
  language,
  sortOption,
  onSortOptionChange,
  favorites = []
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = language || contextLanguage;
  const isRTL = activeLanguage === 'ar';
  const [showSortModal, setShowSortModal] = useState(false);
  
  return (
    <View style={styles.section}>
      {/* Section Title */}
      <View style={[styles.sectionTitleContainer, isRTL && { flexDirection: 'row-reverse' }]}>

        <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
          {getLocalizedString('lebaneseRadioStations', activeLanguage)}
        </Text>
      </View>
      
      {/* Sort Button */}
      <TouchableOpacity
        style={[
          styles.sortButton,
          styles.sortButtonFullWidth,
          isRTL && { 
            flexDirection: 'row-reverse',
            alignSelf: 'flex-end'
          }
        ]}
        onPress={() => setShowSortModal(true)}
      >
        <Ionicons 
          name="options-outline" 
          size={20} 
          color="#7C4DFF" 
        />
        <Text style={[
          styles.sortButtonText,
          isRTL && { marginLeft: 0, marginRight: 5 }
        ]}>
          {getLocalizedString('sortBy', activeLanguage)}
        </Text>
      </TouchableOpacity>

      {/* Radio Stations List */}
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

      {/* Sort Options Modal */}
      <SortOptionsModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        currentSortOption={sortOption}
        onSortOptionSelect={onSortOptionChange}
        styles={styles}
        language={activeLanguage}
      />
    </View>
  );
};

export default LebaneseRadioStations;
