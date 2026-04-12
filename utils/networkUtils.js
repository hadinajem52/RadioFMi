/**
 * Utility functions for network connectivity testing
 */

const POSITIVE_CONNECTIVITY_CACHE_TTL_MS = 45 * 1000;
const NEGATIVE_CONNECTIVITY_CACHE_TTL_MS = 5 * 1000;
const CONNECTIVITY_TIMEOUT_MS = 5000;

let lastConnectivityCheck = {
  checkedAt: 0,
  result: null,
};

export const resetConnectivityProbeCache = () => {
  lastConnectivityCheck = {
    checkedAt: 0,
    result: null,
  };
};

export const testInternetConnectivity = async ({ force = false } = {}) => {
  const now = Date.now();
  const ttl =
    lastConnectivityCheck.result === false
      ? NEGATIVE_CONNECTIVITY_CACHE_TTL_MS
      : POSITIVE_CONNECTIVITY_CACHE_TTL_MS;
  if (
    !force &&
    lastConnectivityCheck.result !== null &&
    now - lastConnectivityCheck.checkedAt < ttl
  ) {
    return lastConnectivityCheck.result;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONNECTIVITY_TIMEOUT_MS);

  try {
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
    });

    const result = response.status === 204;
    lastConnectivityCheck = {
      checkedAt: now,
      result,
    };
    return result;
  } catch (error) {
    console.log('Internet connectivity test failed:', error.message);
    lastConnectivityCheck = {
      checkedAt: now,
      result: false,
    };
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};
