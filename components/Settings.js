import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StatusBar, 
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const Settings = ({ 
  visible, 
  onClose, 
  volume,
  setVolume,
  styles 
}) => {
  const { language, changeLanguage } = useLanguage();
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [highQuality, setHighQuality] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedAutoPlay = await AsyncStorage.getItem('autoPlay');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedHighQuality = await AsyncStorage.getItem('highQuality');

      if (savedAutoPlay !== null) setAutoPlay(JSON.parse(savedAutoPlay));
      if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
      if (savedHighQuality !== null) setHighQuality(JSON.parse(savedHighQuality));
    };

    loadSettings();
  }, []);

  const saveSetting = async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const handleAutoPlayChange = (value) => {
    setAutoPlay(value);
    saveSetting('autoPlay', value);
  };

  const handleNotificationsChange = (value) => {
    setNotifications(value);
    saveSetting('notifications', value);
  };

  const handleHighQualityChange = (value) => {
    setHighQuality(value);
    saveSetting('highQuality', value);
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  const showLanguageSelector = () => {
    const text = {
      title: getLocalizedString('selectLanguage', language),
      subtitle: getLocalizedString('selectLanguageSubtitle', language),
      english: getLocalizedString('english', language),
      arabic: getLocalizedString('arabic', language),
      cancel: getLocalizedString('cancel', language)
    };

    Alert.alert(
      text.title,
      text.subtitle,
      [
        { text: text.english, onPress: () => handleLanguageChange('en') },
        { text: text.arabic, onPress: () => handleLanguageChange('ar') },
        { text: text.cancel, style: 'cancel' }
      ]
    );
  };

  const handleVolumeChange = (value) => {
    if (setVolume) {
      setVolume(value);
    }
  };

  const showAbout = () => {
    const text = {
      title: getLocalizedString('aboutTitle', language),
      content: getLocalizedString('aboutContent', language),
      button: getLocalizedString('ok', language)
    };

    Alert.alert(text.title, text.content, [{ text: text.button }]);
  };

  const getLanguageDisplayName = (lang) => {
    switch (lang) {
      case 'en':
        return 'English';
      case 'ar':
        return 'العربية';
      default:
        return 'English';
    }
  };

  const strings = {
    settings: getLocalizedString('settings', language),
    audio: getLocalizedString('audio', language),
    general: getLocalizedString('general', language),
    autoPlay: getLocalizedString('autoPlay', language),
    autoPlaySub: getLocalizedString('autoPlaySub', language),
    notifications: getLocalizedString('notifications', language),
    notificationsSub: getLocalizedString('notificationsSub', language),
    quality: getLocalizedString('quality', language),
    qualitySub: getLocalizedString('qualitySub', language),
    language: getLocalizedString('language', language),
    languageSub: getLocalizedString('languageSub', language),
    about: getLocalizedString('about', language),
    aboutSub: getLocalizedString('aboutSub', language),
    volume: getLocalizedString('volume', language)
  };

  const t = strings;

  const settingsItems = [
    {
      id: 'volume',
      title: t.volume,
      subtitle: '',
      type: 'slider',
      icon: 'volume-medium-outline',
      value: volume,
      onValueChange: handleVolumeChange
    },
    {
      id: 'autoplay',
      title: t.autoPlay,
      subtitle: t.autoPlaySub,
      type: 'switch',
      icon: 'play-circle-outline',
      value: autoPlay,
      onValueChange: handleAutoPlayChange
    },
    {
      id: 'notifications',
      title: t.notifications,
      subtitle: t.notificationsSub,
      type: 'switch',
      icon: 'notifications-outline',
      value: notifications,
      onValueChange: handleNotificationsChange
    },
    {
      id: 'quality',
      title: t.quality,
      subtitle: t.qualitySub,
      type: 'switch',
      icon: 'musical-note-outline',
      value: highQuality,
      onValueChange: handleHighQualityChange
    }
  ];

  const actionItems = [
    {
      id: 'language',
      title: t.language,
      subtitle: t.languageSub,
      icon: 'language-outline',
      onPress: showLanguageSelector,
      value: getLanguageDisplayName(language)
    },
    {
      id: 'about',
      title: t.about,
      subtitle: t.aboutSub,
      icon: 'information-circle-outline',
      onPress: showAbout
    }
  ];

  const renderSettingItem = (item) => {
    if (item.type === 'slider') {
      return (
        <View key={item.id} style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <Ionicons 
              name={item.icon} 
              size={22} 
              color="#666" 
              style={styles.settingsItemIcon}
            />
            <View style={styles.settingsItemText}>
              <Text style={styles.settingsItemTitle}>{item.title}</Text>
              <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <View style={styles.volumeSliderContainer}>
            <TouchableOpacity 
              onPress={() => handleVolumeChange(Math.max(0, (volume || 1) - 0.1))}
              style={styles.volumeButton}
            >
              <Ionicons name="volume-low" size={16} color="#666" />
            </TouchableOpacity>
            <View style={styles.volumeSlider}>
              {[...Array(10)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.volumeBar,
                    { backgroundColor: index < (volume || 1) * 10 ? '#007AFF' : '#e0e0e0' }
                  ]}
                  onPress={() => handleVolumeChange((index + 1) / 10)}
                />
              ))}
            </View>
            <TouchableOpacity 
              onPress={() => handleVolumeChange(Math.min(1, (volume || 1) + 0.1))}
              style={styles.volumeButton}
            >
              <Ionicons name="volume-high" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === 'switch') {
      return (
        <TouchableOpacity 
          key={item.id} 
          style={styles.settingsItem}
          onPress={() => item.onValueChange && item.onValueChange(!item.value)}
        >
          <View style={styles.settingsItemLeft}>
            <Ionicons 
              name={item.icon} 
              size={22} 
              color="#666" 
              style={styles.settingsItemIcon}
            />
            <View style={styles.settingsItemText}>
              <Text style={styles.settingsItemTitle}>{item.title}</Text>
              <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderActionItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.settingsItem}
      onPress={item.onPress}
    >
      <View style={styles.settingsItemLeft}>
        <Ionicons 
          name={item.icon} 
          size={22} 
          color="#666" 
          style={styles.settingsItemIcon}
        />
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{item.title}</Text>
          <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {item.value && (
          <Text style={styles.settingsItemValue}>{item.value}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.settingsContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.settingsHeader}>
          <TouchableOpacity
            style={styles.settingsBackButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.settingsHeaderTitle}>{t.settings}</Text>
          
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* Audio Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>{t.audio}</Text>
            {settingsItems.map(renderSettingItem)}
          </View>

          {/* General Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>{t.general}</Text>
            {actionItems.map(renderActionItem)}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default Settings;
