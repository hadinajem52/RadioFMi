import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StatusBar, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedString } from '../localization/strings';

const Settings = ({ 
  visible, 
  onClose, 
  styles 
}) => {
  const { language, changeLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Check if current language is RTL
  const isRTL = language === 'ar';

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    setShowLanguageModal(false);
  };

  const showLanguageSelector = () => {
    setShowLanguageModal(true);
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
    general: getLocalizedString('general', language),
    language: getLocalizedString('language', language),
    languageSub: getLocalizedString('languageSub', language),
    about: getLocalizedString('about', language),
    aboutSub: getLocalizedString('aboutSub', language)
  };

  const t = strings;

  const settingsItems = [
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

  const renderSettingItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={isRTL ? styles.rtlSettingsItem : styles.settingsItem}
      onPress={item.onPress}
    >
      <View style={isRTL ? styles.rtlSettingsItemLeft : styles.settingsItemLeft}>
        <Ionicons 
          name={item.icon} 
          size={22} 
          color="#fff" 
          style={isRTL ? styles.rtlSettingsItemIcon : styles.settingsItemIcon}
        />
        <View style={isRTL ? styles.rtlSettingsItemText : styles.settingsItemText}>
          <Text style={isRTL ? styles.rtlSettingsItemTitle : styles.settingsItemTitle}>{item.title}</Text>
          <Text style={isRTL ? styles.rtlSettingsItemSubtitle : styles.settingsItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={isRTL ? styles.rtlSettingsItemRight : styles.settingsItemRight}>
        {item.value && (
          <Text style={isRTL ? styles.rtlSettingsItemValue : styles.settingsItemValue}>{item.value}</Text>
        )}
        <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const renderLanguageModal = () => {
    const text = {
      title: getLocalizedString('selectLanguage', language),
      english: getLocalizedString('english', language),
      arabic: getLocalizedString('arabic', language),
      cancel: getLocalizedString('cancel', language)
    };

    const languages = [
      { code: 'en', name: text.english, nativeName: 'English' },
      { code: 'ar', name: text.arabic, nativeName: 'العربية' }
    ];

    return (
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={isRTL ? styles.rtlLanguageModal : styles.languageModal}>
            <View style={isRTL ? styles.rtlLanguageModalHeader : styles.languageModalHeader}>
              <Text style={isRTL ? styles.rtlLanguageModalTitle : styles.languageModalTitle}>
                {text.title}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageOptions}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    isRTL ? styles.rtlLanguageOption : styles.languageOption,
                    language === lang.code && styles.selectedLanguageOption
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <View style={isRTL ? styles.rtlLanguageOptionContent : styles.languageOptionContent}>
                    <Text style={[
                      isRTL ? styles.rtlLanguageOptionName : styles.languageOptionName,
                      language === lang.code && styles.selectedLanguageOptionText
                    ]}>
                      {lang.name}
                    </Text>
                    <Text style={[
                      isRTL ? styles.rtlLanguageOptionNative : styles.languageOptionNative,
                      language === lang.code && styles.selectedLanguageOptionSubtext
                    ]}>
                      {lang.nativeName}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      {renderLanguageModal()}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <View style={styles.settingsContainer}>
          <StatusBar barStyle="dark-content" />

          {/* Header */}
          <View style={isRTL ? styles.rtlSettingsHeader : styles.settingsHeader}>
            <TouchableOpacity
              style={styles.settingsBackButton}
              onPress={onClose}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={isRTL ? styles.rtlSettingsHeaderTitle : styles.settingsHeaderTitle}>{t.settings}</Text>

            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingsSection}>
              <Text style={isRTL ? styles.rtlSettingsSectionTitle : styles.settingsSectionTitle}>{t.general}</Text>
              {settingsItems.map(renderSettingItem)}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default Settings;
