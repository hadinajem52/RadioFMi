import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StreamHealthIndicator = ({ station, size = 16, style = {} }) => {
  const [healthStatus, setHealthStatus] = useState('unknown');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkStreamHealth();
  }, [station.url]);

  const checkStreamHealth = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const startTime = Date.now();
      const response = await fetch(station.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RadioFMi/1.0',
          'Accept': 'audio/*',
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        if (responseTime < 2000) {
          setHealthStatus('excellent');
        } else if (responseTime < 5000) {
          setHealthStatus('good');
        } else {
          setHealthStatus('slow');
        }
      } else {
        setHealthStatus('error');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setHealthStatus('timeout');
      } else {
        setHealthStatus('unreachable');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const getHealthIndicator = () => {
    switch (healthStatus) {
      case 'excellent':
        return { icon: 'wifi', color: '#00ff00' };
      case 'good':
        return { icon: 'wifi', color: '#90EE90' };
      case 'slow':
        return { icon: 'wifi', color: '#ffa500' };
      case 'timeout':
      case 'error':
        return { icon: 'cloud-offline-outline', color: '#ff4444' };
      case 'unreachable':
        return { icon: 'close-circle', color: '#ff4444' };
      default:
        return { icon: 'wifi-outline', color: '#888' };
    }
  };

  const indicator = getHealthIndicator();

  return (
    <View style={[{
      width: size + 4,
      height: size + 4,
      justifyContent: 'center',
      alignItems: 'center',
    }, style]}>
      <Ionicons 
        name={indicator.icon} 
        size={size} 
        color={indicator.color}
      />
    </View>
  );
};

export default StreamHealthIndicator;
