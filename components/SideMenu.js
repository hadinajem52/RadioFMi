import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const SideMenu = ({ visible, onClose, onGenreSelect, onSettingsPress, styles }) => {
  const { language } = useLanguage();
  const slideAnim = useRef(new Animated.Value(-280)).current; // Start off-screen to the left
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      // Show modal first, then animate in
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      // Animate out first, then hide modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -280,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, slideAnim, opacityAnim, modalVisible]);

  const handleClose = () => {
    // Start the close animation by setting visible to false
    onClose();
  };

  const genres = [
    { id: 'news', name: getLocalizedString('newsAndTalk', language), icon: 'newspaper-outline' },
    { id: 'music', name: getLocalizedString('musicAndEntertainment', language), icon: 'musical-notes-outline' },
    { id: 'religious', name: getLocalizedString('religious', language), icon: 'heart-outline' }
  ];

  const handleGenrePress = (genreId) => {
    onGenreSelect(genreId);
    handleClose();
  };

  const handleSettingsPress = () => {
    onSettingsPress();
    handleClose();
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.sideMenuOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={[
          styles.sideMenuContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}>
          <StatusBar barStyle="dark-content" />
          
          {/* Menu Header */}
          <View style={styles.sideMenuHeader}>
            <Text style={styles.sideMenuTitle}>{getLocalizedString('appTitle', language)}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.sideMenuCloseButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Genre Sections */}
          <View style={styles.sideMenuContent}>
            <Text style={styles.sideMenuSectionTitle}>{getLocalizedString('browseByGenre', language)}</Text>
            
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={styles.sideMenuItem}
                onPress={() => handleGenrePress(genre.id)}
              >
                <Ionicons 
                  name={genre.icon} 
                  size={22} 
                  color="#666" 
                  style={styles.sideMenuItemIcon}
                />
                <Text style={styles.sideMenuItemText}>{genre.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.sideMenuDivider} />

            {/* Settings */}
            <TouchableOpacity
              style={styles.sideMenuItem}
              onPress={handleSettingsPress}
            >
              <Ionicons 
                name="settings-outline" 
                size={22} 
                color="#666" 
                style={styles.sideMenuItemIcon}
              />
              <Text style={styles.sideMenuItemText}>{getLocalizedString('settings', language)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </Animated.View>
        <TouchableOpacity 
          style={styles.sideMenuBackdrop} 
          onPress={handleClose} 
          activeOpacity={1}
        />
      </Animated.View>
    </Modal>
  );
};

export default SideMenu;
