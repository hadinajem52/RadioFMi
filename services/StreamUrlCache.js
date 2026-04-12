import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'stream_cache_';
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;

/**
 * Extracts the stream URL from an ORB ?played=1&ajax=1 HTML fragment.
 * Looks for the stream="..." attribute on the play button.
 * Returns null if not found or empty.
 */
export function parseStreamUrl(html) {
  const marker = 'stream="';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const valueStart = start + marker.length;
  const end = html.indexOf('"', valueStart);
  if (end === -1) return null;
  const url = html.slice(valueStart, end);
  return url.length > 0 ? url : null;
}

const TTL_WEEK = 7 * 24 * 60 * 60 * 1000;
const TTL_DAY = 24 * 60 * 60 * 1000;

/**
 * Determines cache TTL based on the resolved URL type.
 * Zeno.fm and StreamTheWorld URLs are permanently valid — cache for 7 days.
 * Everything else cached for 24 hours.
 */
export function getTTL(url) {
  if (!url) return TTL_DAY;
  if (
    url.includes('stream.zeno.fm') ||
    url.includes('playerservices.streamtheworld.com')
  ) {
    return TTL_WEEK;
  }
  return TTL_DAY;
}

/**
 * Extracts the /{country}/{slug}/ path from a webViewFallbackUrl.
 * Handles both https://onlineradiobox.com/lb/mixfm/?...
 * and http://p.onlineradiobox.com/lb/station/player/?...
 * Returns null if the URL is not an ORB URL or input is null.
 */
export function extractOrbPath(webViewFallbackUrl) {
  if (!webViewFallbackUrl) return null;
  try {
    const url = new URL(webViewFallbackUrl);
    if (!url.hostname.includes('onlineradiobox.com')) return null;
    // Remove /player/ suffix if present, then ensure trailing slash
    const path = url.pathname.replace(/\/player\/?$/, '');
    return path.endsWith('/') ? path : path + '/';
  } catch {
    return null;
  }
}

/**
 * Fetches the current stream URL for a station from ORB.
 * Returns null if the fetch fails or the stream attribute is empty.
 */
async function fetchFromOrb(webViewFallbackUrl) {
  const path = extractOrbPath(webViewFallbackUrl);
  if (!path) return null;

  const apiUrl = `https://onlineradiobox.com${path}?played=1&ajax=1`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: 'text/html' },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const html = await response.text();
    return parseStreamUrl(html);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Returns the cached stream URL for a station if it exists and has not expired.
 * Returns null if no cache entry exists or the entry is expired.
 */
async function getUrl(station) {
  if (!station?.webViewFallbackUrl) return null;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY_PREFIX + station.id);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > getTTL(entry.url)) return null;
    return entry.url;
  } catch {
    return null;
  }
}

/**
 * Writes a resolved URL to AsyncStorage for a given station id.
 */
async function saveUrl(stationId, url) {
  const entry = { url, fetchedAt: Date.now(), source: 'orb' };
  await AsyncStorage.setItem(CACHE_KEY_PREFIX + stationId, JSON.stringify(entry));
}

/**
 * Removes the cache entry for a station.
 * Called when playback fails so the next attempt fetches a fresh URL.
 */
async function invalidate(stationId) {
  try {
    await AsyncStorage.removeItem(CACHE_KEY_PREFIX + stationId);
  } catch {
    // Ignore — worst case we just re-fetch on next play
  }
}

/**
 * Fetches a fresh URL from ORB, saves it to cache, and returns it.
 * Returns null if the station has no webViewFallbackUrl or the fetch fails.
 */
async function refetch(station) {
  if (!station?.webViewFallbackUrl) return null;
  try {
    const url = await fetchFromOrb(station.webViewFallbackUrl);
    if (url) await saveUrl(station.id, url);
    return url;
  } catch {
    return null;
  }
}

/**
 * Pre-fetches stream URLs for all stations that have a webViewFallbackUrl.
 * Runs in batches of 5 with a 200ms gap between batches to avoid flooding the network.
 * Skips stations whose cache is still valid. Safe to fire-and-forget.
 */
async function prefetchAll(stations) {
  const eligible = stations.filter((s) => s.webViewFallbackUrl);

  for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
    const batch = eligible.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (station) => {
        try {
          const cached = await getUrl(station);
          if (cached) return; // still valid, skip network call
          const url = await fetchFromOrb(station.webViewFallbackUrl);
          if (url) await saveUrl(station.id, url);
        } catch (e) {
          console.log(`StreamUrlCache: prefetch failed for ${station.name}:`, e.message);
        }
      })
    );

    if (i + BATCH_SIZE < eligible.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
}

export default { getUrl, invalidate, refetch, prefetchAll };
