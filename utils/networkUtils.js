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


