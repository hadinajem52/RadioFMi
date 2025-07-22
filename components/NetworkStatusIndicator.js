import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NetworkStatusIndicator = ({ 
  isConnected, 
  isInternetReachable, 
  connectionType, 
  hasGoodConnection,
  styles 
}) => {
  // Don't show anything if connection is good
  if (hasGoodConnection()) {
    return null;
  }

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: 'wifi-outline',
        color: '#ff4757',
        text: 'No connection',
        backgroundColor: 'rgba(255, 71, 87, 0.1)'
      };
    }
    
    if (!isInternetReachable) {
      return {
        icon: 'warning-outline',
        color: '#ffa502',
        text: 'No internet access',
        backgroundColor: 'rgba(255, 165, 2, 0.1)'
      };
    }
    
    // Should not reach here if hasGoodConnection() works correctly
    return {
      icon: 'information-circle-outline',
      color: '#3742fa',
      text: 'Connection status unknown',
      backgroundColor: 'rgba(55, 66, 250, 0.1)'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[localStyles.container, { backgroundColor: statusInfo.backgroundColor }]}>
      <Ionicons 
        name={statusInfo.icon} 
        size={16} 
        color={statusInfo.color}
        style={localStyles.icon}
      />
      <Text style={[localStyles.text, { color: statusInfo.color }]}>
        {statusInfo.text}
      </Text>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});

export default NetworkStatusIndicator;
