import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'stream_cache_';
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;
const DEFAULT_PREFETCH_LIMIT = 10;
const DEFER_DELAY_MS = 1000;
const memoryCache = new Map();

const TTL_WEEK = 7 * 24 * 60 * 60 * 1000;
const TTL_DAY = 24 * 60 * 60 * 1000;

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

export function getTTL(url) {
  if (!url) return TTL_DAY;
  if (url.includes('stream.zeno.fm') || url.includes('playerservices.streamtheworld.com')) {
    return TTL_WEEK;
  }
  return TTL_DAY;
}

const buildCacheKey = (stationId) => `${CACHE_KEY_PREFIX}${stationId}`;

const isEntryFresh = (entry) =>
  Boolean(entry?.url) && Date.now() - entry.fetchedAt <= getTTL(entry.url);

const getMemoryEntry = (stationId) => {
  const entry = memoryCache.get(stationId);
  if (!entry) {
    return null;
  }
  if (!isEntryFresh(entry)) {
    memoryCache.delete(stationId);
    return null;
  }
  return entry;
};

const setMemoryEntry = (stationId, entry) => {
  if (isEntryFresh(entry)) {
    memoryCache.set(stationId, entry);
  }
};

const removeCacheEntry = async (stationId) => {
  memoryCache.delete(stationId);
  try {
    await AsyncStorage.removeItem(buildCacheKey(stationId));
  } catch {
    // ignore
  }
};

export function extractOrbPath(webViewFallbackUrl) {
  if (!webViewFallbackUrl) return null;
  try {
    const url = new URL(webViewFallbackUrl);
    if (!url.hostname.includes('onlineradiobox.com')) return null;
    const path = url.pathname.replace(/\/player\/?$/, '');
    return path.endsWith('/') ? path : `${path}/`;
  } catch {
    return null;
  }
}

async function fetchFromOrb(webViewFallbackUrl) {
  const path = extractOrbPath(webViewFallbackUrl);
  if (!path) return null;

  const apiUrl = `https://onlineradiobox.com${path}?played=1&ajax=1`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        Referer: 'https://onlineradiobox.com/',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    let content = text;

    try {
      const json = JSON.parse(text);
      if (json.data && typeof json.data === 'string') {
        content = json.data;
      }
    } catch {
      // keep raw content
    }

    return parseStreamUrl(content);
  } finally {
    clearTimeout(timeoutId);
  }
}

const saveEntry = async (stationId, url) => {
  const entry = { url, fetchedAt: Date.now(), source: 'orb' };
  setMemoryEntry(stationId, entry);
  await AsyncStorage.setItem(buildCacheKey(stationId), JSON.stringify(entry));
};

async function getUrl(station) {
  if (!station?.webViewFallbackUrl || !station?.id) {
    return null;
  }

  const memoryEntry = getMemoryEntry(station.id);
  if (memoryEntry) {
    return memoryEntry.url;
  }

  try {
    const raw = await AsyncStorage.getItem(buildCacheKey(station.id));
    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw);
    if (!isEntryFresh(entry)) {
      removeCacheEntry(station.id);
      return null;
    }

    setMemoryEntry(station.id, entry);
    return entry.url;
  } catch {
    return null;
  }
}

async function invalidate(stationId) {
  if (!stationId) {
    return;
  }
  await removeCacheEntry(stationId);
}

async function refetch(station) {
  if (!station?.webViewFallbackUrl || !station?.id) {
    return null;
  }

  try {
    const url = await fetchFromOrb(station.webViewFallbackUrl);
    if (url) {
      await saveEntry(station.id, url);
    }
    return url;
  } catch {
    return null;
  }
}

const prioritizeStations = (stations, priorityStationIds = []) => {
  if (!priorityStationIds.length) {
    return stations;
  }

  const prioritySet = new Set(priorityStationIds);
  const priority = [];
  const rest = [];

  for (const station of stations) {
    if (prioritySet.has(station.id)) {
      priority.push(station);
    } else {
      rest.push(station);
    }
  }

  return [...priority, ...rest];
};

async function prefetchAll(stations, options = {}) {
  const {
    limit = DEFAULT_PREFETCH_LIMIT,
    priorityStationIds = [],
    defer = false,
  } = options;

  if (defer) {
    await new Promise((resolve) => setTimeout(resolve, DEFER_DELAY_MS));
  }

  const eligibleStations = stations.filter((station) => station.webViewFallbackUrl && station.id);
  const prioritizedStations = prioritizeStations(eligibleStations, priorityStationIds);
  const selectedStations =
    typeof limit === 'number' && limit > 0
      ? prioritizedStations.slice(0, limit)
      : prioritizedStations;

  for (let i = 0; i < selectedStations.length; i += BATCH_SIZE) {
    const batch = selectedStations.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (station) => {
        try {
          const cached = await getUrl(station);
          if (cached) {
            return;
          }

          const url = await fetchFromOrb(station.webViewFallbackUrl);
          if (url) {
            await saveEntry(station.id, url);
          }
        } catch (error) {
          console.log(`StreamUrlCache: prefetch failed for ${station.name}:`, error?.message || error);
        }
      })
    );

    if (i + BATCH_SIZE < selectedStations.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
}

export default { getUrl, invalidate, refetch, prefetchAll };
