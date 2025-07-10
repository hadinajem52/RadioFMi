import React, { useState } from 'react';
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

const Settings = ({ 
  visible, 
  onClose, 
  volume,
  setVolume,
  styles 
}) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [highQuality, setHighQuality] = useState(false);

  const handleVolumeChange = (value) => {
    if (setVolume) {
      setVolume(value);
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About Radio FM',
      'Radio FM - Lebanese Radio Stations\nVersion 1.0.0\n\nEnjoy listening to your favorite Lebanese radio stations.',
      [{ text: 'OK' }]
    );
  };

  const settingsItems = [
    {
      id: 'volume',
      title: 'Volume',
      subtitle: `${Math.round((volume || 1) * 100)}%`,
      type: 'slider',
      icon: 'volume-medium-outline'
    },
    {
      id: 'autoplay',
      title: 'Auto-play next station',
      subtitle: 'Automatically play next station when current ends',
      type: 'switch',
      icon: 'play-circle-outline',
      value: autoPlay,
      onValueChange: setAutoPlay
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Show notifications for now playing',
      type: 'switch',
      icon: 'notifications-outline',
      value: notifications,
      onValueChange: setNotifications
    },
    {
      id: 'quality',
      title: 'High Quality Audio',
      subtitle: 'Use higher bitrate streams when available',
      type: 'switch',
      icon: 'musical-note-outline',
      value: highQuality,
      onValueChange: setHighQuality
    }
  ];

  const actionItems = [
    {
      id: 'about',
      title: 'About',
      subtitle: 'App information and version',
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
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
          
          <Text style={styles.settingsHeaderTitle}>Settings</Text>
          
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* Audio Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Audio</Text>
            {settingsItems.map(renderSettingItem)}
          </View>

          {/* General Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>General</Text>
            {actionItems.map(renderActionItem)}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default Settings;
