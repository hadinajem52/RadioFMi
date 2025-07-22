/**
 * Utility functions for network connectivity testing
 */

// Test internet connectivity by trying to reach a reliable endpoint
export const testInternetConnectivity = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });

    clearTimeout(timeoutId);
    return response.status === 204;
  } catch (error) {
    console.log('Internet connectivity test failed:', error.message);
    return false;
  }
};

// Test if a specific radio stream URL is reachable
export const testRadioStreamConnectivity = async (streamUrl, timeout = 10000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(streamUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Check if the response is OK and has audio content type
    const contentType = response.headers.get('content-type');
    const isAudioStream = contentType && (
      contentType.includes('audio/') || 
      contentType.includes('application/ogg') ||
      contentType.includes('video/x-ms-asf') // For some streaming formats
    );

    return response.ok && (isAudioStream || response.status === 200);
  } catch (error) {
    console.log(`Radio stream connectivity test failed for ${streamUrl}:`, error.message);
    return false;
  }
};

// Get network quality estimate based on connection speed test
export const estimateNetworkQuality = async () => {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Categorize network quality based on response time
    if (responseTime < 100) {
      return { quality: 'excellent', responseTime };
    } else if (responseTime < 300) {
      return { quality: 'good', responseTime };
    } else if (responseTime < 1000) {
      return { quality: 'fair', responseTime };
    } else {
      return { quality: 'poor', responseTime };
    }
  } catch (error) {
    console.log('Network quality test failed:', error.message);
    return { quality: 'unknown', responseTime: null, error: error.message };
  }
};
