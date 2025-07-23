import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';
import { SORT_OPTIONS } from '../hooks/useSorting';

const SortOptionsModal = ({
  visible,
  onClose,
  currentSortOption,
  onSortOptionSelect,
  styles,
  language
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = language || contextLanguage;
  const isRTL = activeLanguage === 'ar';

  const sortOptions = [
    {
      key: SORT_OPTIONS.NAME_ASC,
      label: getLocalizedString('sortByName', activeLanguage),
      icon: 'text-outline'
    },
    {
      key: SORT_OPTIONS.NAME_DESC,
      label: getLocalizedString('sortByNameDesc', activeLanguage),
      icon: 'text-outline'
    },
    {
      key: SORT_OPTIONS.GENRE,
      label: getLocalizedString('sortByGenre', activeLanguage),
      icon: 'library-outline'
    },
    {
      key: SORT_OPTIONS.FAVORITES_FIRST,
      label: getLocalizedString('sortByFavorites', activeLanguage),
      icon: 'heart-outline'
    },
    {
      key: SORT_OPTIONS.RECENTLY_PLAYED,
      label: getLocalizedString('sortByRecentlyPlayed', activeLanguage),
      icon: 'time-outline'
    }
  ];

  const handleOptionSelect = (option) => {
    onSortOptionSelect(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.languageModal, { maxHeight: '80%' }]}>
          <LinearGradient
            colors={['#2d1b69', '#4a1c6e', '#5a2d5a']}
            style={{ flex: 1, borderRadius: 16 }}
          >
            {/* Header */}
            <View style={[
              styles.languageModalHeader,
              isRTL && styles.rtlLanguageModalHeader
            ]}>
              <Text style={[
                styles.languageModalTitle,
                isRTL && styles.rtlLanguageModalTitle
              ]}>
                {getLocalizedString('sortOptions', activeLanguage)}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Sort Options List */}
            <ScrollView
              style={styles.languageOptions}
              showsVerticalScrollIndicator={false}
            >
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOptionItem,
                    currentSortOption === option.key && styles.selectedLanguageOption,
                    isRTL && styles.rtlLanguageOption
                  ]}
                  onPress={() => handleOptionSelect(option.key)}
                >
                  <View style={[
                    styles.sortOptionIconContainer,
                    isRTL && { marginLeft: 15, marginRight: 0 }
                  ]}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={currentSortOption === option.key ? "#7C4DFF" : "#ffffff"}
                    />
                  </View>
                  
                  <Text style={[
                    styles.sortOptionText,
                    currentSortOption === option.key && styles.selectedLanguageOptionText,
                    isRTL && { textAlign: 'right' }
                  ]}>
                    {option.label}
                  </Text>
                  
                  {currentSortOption === option.key && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#7C4DFF"
                      style={[
                        { marginLeft: 'auto' },
                        isRTL && { marginLeft: 0, marginRight: 'auto' }
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default SortOptionsModal;
