import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';
import SortOptionsModal from './SortOptionsModal';

const ITEM_HEIGHT = 94;

const LebaneseRadioStations = ({
  styles,
  radioStations,
  currentStation,
  playStation,
  togglePlayPause,
  sortOption,
  onSortOptionChange,
  listHeaderComponent = null,
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [showSortModal, setShowSortModal] = useState(false);

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

  const renderStationItem = useCallback(
    ({ item: station }) => (
      <TouchableOpacity
        style={[
          styles.stationRow,
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
          resizeMode="contain"
        />
        <View style={styles.stationInfo}>
          <Text
            style={[
              styles.stationName,
              isRTL && {
                textAlign: 'right',
              },
            ]}
          >
            {isRTL ? station.nameAr || station.name : station.name}
          </Text>
          <Text
            style={[
              styles.stationDescription,
              isRTL && {
                textAlign: 'right',
              },
            ]}
          >
            {getLocalizedString('liveRadio', language)}
          </Text>
        </View>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#ccc" />
      </TouchableOpacity>
    ),
    [handleStationPress, isRTL, language, styles]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const listHeader = useMemo(
    () => (
      <>
        {listHeaderComponent}
        <View style={styles.section}>
          <View style={[styles.sectionTitleContainer, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
              {getLocalizedString('lebaneseRadioStations', language)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.sortButton,
              styles.sortButtonFullWidth,
              isRTL && {
                flexDirection: 'row-reverse',
                alignSelf: 'flex-end',
              },
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="options-outline" size={20} color="#7C4DFF" />
            <Text style={[styles.sortButtonText, isRTL && { marginLeft: 0, marginRight: 5 }]}>
              {getLocalizedString('sortBy', language)}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    ),
    [isRTL, language, listHeaderComponent, styles]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={radioStations}
        renderItem={renderStationItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={11}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />

      <SortOptionsModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        currentSortOption={sortOption}
        onSortOptionSelect={onSortOptionChange}
        styles={styles}
        language={language}
      />
    </View>
  );
};

export default React.memo(LebaneseRadioStations);
