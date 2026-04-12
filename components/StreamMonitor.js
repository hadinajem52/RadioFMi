import React, { useState, useEffect } from 'react';
import { AppState, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStreamStatus } from '../services/TrackPlayerService';

const StreamMonitor = ({ visible, onClose, currentStation }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    if (visible && currentStation && isForeground) {
      fetchDiagnostics();
      const interval = setInterval(fetchDiagnostics, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [visible, currentStation, isForeground]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsForeground(nextState === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchDiagnostics = async () => {
    try {
      setRefreshing(true);
      const status = await getStreamStatus();

      setDiagnostics({
        ...status,
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'playing': return '#00ff00';
      case 'paused': return '#ffa500';
      case 'buffering': return '#ffff00';
      case 'stopped': return '#888';
      case 'error': return '#ff4444';
      default: return '#fff';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingTop: 50,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#333',
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Poppins-Bold',
          }}>
            Stream Diagnostics
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Station Info */}
          {currentStation && (
            <View style={{
              backgroundColor: '#2a2a2a',
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
                marginBottom: 10,
              }}>
                Current Station
              </Text>
              <Text style={{ color: '#ccc', marginBottom: 5, fontFamily: 'Poppins-Regular' }}>
                Name: {currentStation.name}
              </Text>
              <Text style={{ color: '#ccc', marginBottom: 5, fontFamily: 'Poppins-Regular' }}>
                URL: {currentStation.url}
              </Text>
              <Text style={{ color: '#ccc', fontFamily: 'Poppins-Regular' }}>
                Description: {currentStation.description}
              </Text>
            </View>
          )}

          {/* Playback Status */}
          {diagnostics && (
            <View style={{
              backgroundColor: '#2a2a2a',
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
                marginBottom: 10,
              }}>
                Playback Status
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
              }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: getStateColor(diagnostics.state),
                  marginRight: 10,
                }} />
                <Text style={{ color: '#ccc', fontFamily: 'Poppins-Regular' }}>
                  State: {diagnostics.state || 'Unknown'}
                </Text>
              </View>
              <Text style={{ color: '#ccc', marginBottom: 5, fontFamily: 'Poppins-Regular' }}>
                Position: {Math.floor(diagnostics.position || 0)}s
              </Text>
              <Text style={{ color: '#ccc', marginBottom: 5, fontFamily: 'Poppins-Regular' }}>
                Duration: {diagnostics.duration ? Math.floor(diagnostics.duration) + 's' : 'Live Stream'}
              </Text>
              <Text style={{ color: '#ccc', fontFamily: 'Poppins-Regular' }}>
                Is Live Stream: {diagnostics.isLiveStream ? 'Yes' : 'No'}
              </Text>
            </View>
          )}

          {/* Error Information */}
          {diagnostics?.error && (
            <View style={{
              backgroundColor: '#2a2a2a',
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
            }}>
              <Text style={{
                color: '#ff4444',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
                marginBottom: 10,
              }}>
                Error Details
              </Text>
              <Text style={{ color: '#ff6666', fontFamily: 'Poppins-Regular' }}>
                {diagnostics.error}
              </Text>
            </View>
          )}

          {/* Refresh Info */}
          <View style={{
            backgroundColor: '#2a2a2a',
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Poppins-Bold',
              marginBottom: 10,
            }}>
              Debug Information
            </Text>
            <Text style={{ color: '#ccc', marginBottom: 5, fontFamily: 'Poppins-Regular' }}>
              Last Updated: {diagnostics?.lastUpdated || 'Never'}
            </Text>
            <Text style={{ color: '#ccc', fontFamily: 'Poppins-Regular' }}>
              Auto-refresh: Every 5 seconds (foreground only)
            </Text>
          </View>
        </ScrollView>

        {/* Refresh Button */}
        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#333',
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={fetchDiagnostics}
            disabled={refreshing}
          >
            {refreshing && (
              <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 10 }} />
            )}
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Poppins-Bold',
            }}>
              {refreshing ? 'Refreshing...' : 'Refresh Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StreamMonitor;
