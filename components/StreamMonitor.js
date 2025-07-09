import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStreamStatus } from '../services/TrackPlayerService';

const StreamMonitor = ({ visible, onClose, currentStation }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible && currentStation) {
      fetchDiagnostics();
      const interval = setInterval(fetchDiagnostics, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, currentStation]);

  const fetchDiagnostics = async () => {
    try {
      setRefreshing(true);
      const status = await getStreamStatus();
      
      // Add network diagnostics
      const networkInfo = await checkNetworkStatus(currentStation?.url);
      
      setDiagnostics({
        ...status,
        network: networkInfo,
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const checkNetworkStatus = async (url) => {
    if (!url) return { status: 'unknown' };
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 5000 
      });
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'reachable' : 'error',
        responseTime,
        statusCode: response.status,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      return {
        status: 'unreachable',
        error: error.message
      };
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

  const getNetworkStatusColor = (status) => {
    switch (status) {
      case 'reachable': return '#00ff00';
      case 'unreachable': return '#ff4444';
      case 'error': return '#ffa500';
      default: return '#888';
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
                marginBottom: 10,
              }}>
                Current Station
              </Text>
              <Text style={{ color: '#ccc', marginBottom: 5 }}>
                Name: {currentStation.name}
              </Text>
              <Text style={{ color: '#ccc', marginBottom: 5 }}>
                URL: {currentStation.url}
              </Text>
              <Text style={{ color: '#ccc' }}>
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
                <Text style={{ color: '#ccc' }}>
                  State: {diagnostics.state || 'Unknown'}
                </Text>
              </View>
              <Text style={{ color: '#ccc', marginBottom: 5 }}>
                Position: {Math.floor(diagnostics.position || 0)}s
              </Text>
              <Text style={{ color: '#ccc', marginBottom: 5 }}>
                Duration: {diagnostics.duration ? Math.floor(diagnostics.duration) + 's' : 'Live Stream'}
              </Text>
              <Text style={{ color: '#ccc' }}>
                Is Live Stream: {diagnostics.isLiveStream ? 'Yes' : 'No'}
              </Text>
            </View>
          )}

          {/* Network Status */}
          {diagnostics?.network && (
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
                marginBottom: 10,
              }}>
                Network Status
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
                  backgroundColor: getNetworkStatusColor(diagnostics.network.status),
                  marginRight: 10,
                }} />
                <Text style={{ color: '#ccc' }}>
                  Status: {diagnostics.network.status}
                </Text>
              </View>
              {diagnostics.network.responseTime && (
                <Text style={{ color: '#ccc', marginBottom: 5 }}>
                  Response Time: {diagnostics.network.responseTime}ms
                </Text>
              )}
              {diagnostics.network.statusCode && (
                <Text style={{ color: '#ccc', marginBottom: 5 }}>
                  HTTP Status: {diagnostics.network.statusCode}
                </Text>
              )}
              {diagnostics.network.contentType && (
                <Text style={{ color: '#ccc', marginBottom: 5 }}>
                  Content Type: {diagnostics.network.contentType}
                </Text>
              )}
              {diagnostics.network.error && (
                <Text style={{ color: '#ff4444' }}>
                  Error: {diagnostics.network.error}
                </Text>
              )}
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
                marginBottom: 10,
              }}>
                Error Details
              </Text>
              <Text style={{ color: '#ff6666' }}>
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
              marginBottom: 10,
            }}>
              Debug Information
            </Text>
            <Text style={{ color: '#ccc', marginBottom: 5 }}>
              Last Updated: {diagnostics?.lastUpdated || 'Never'}
            </Text>
            <Text style={{ color: '#ccc' }}>
              Auto-refresh: Every 2 seconds
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
