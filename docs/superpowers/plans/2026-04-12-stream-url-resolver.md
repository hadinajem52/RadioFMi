# Stream URL Auto-Resolver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manually-maintained hardcoded stream URLs with an automatic resolver that fetches current working URLs from OnlineRadioBox at app launch and caches them in AsyncStorage.

**Architecture:** A new `StreamUrlCache` service fetches stream URLs from `https://onlineradiobox.com/{country}/{slug}/?played=1&ajax=1`, parses the `stream=""` HTML attribute, and caches results in AsyncStorage. `usePlayer.js` consults the cache before playing and retries with a fresh URL on failure before falling back to the existing WebView.

**Tech Stack:** React Native (Expo 53), `@react-native-async-storage/async-storage` (already installed), `jest-expo` (added for tests), native `fetch` API.

---

## Task 1: Set up Jest

**Files:**
- Modify: `package.json`
- Create: `babel.config.js`
- Create: `__tests__/StreamUrlCache.test.js` (empty placeholder)

- [ ] **Step 1: Install jest-expo**

```bash
npm install --save-dev jest jest-expo
```

Expected: packages added to `node_modules`, `package.json` devDependencies updated.

- [ ] **Step 2: Add jest config to `package.json`**

Add a `"jest"` key at the top level of `package.json` (alongside `"dependencies"`):

```json
"jest": {
  "preset": "jest-expo",
  "testPathPattern": "__tests__"
}
```

- [ ] **Step 3: Create `babel.config.js`**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

- [ ] **Step 4: Create the test file**

Create `__tests__/StreamUrlCache.test.js` with a placeholder:

```javascript
describe('StreamUrlCache', () => {
  it('placeholder', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 5: Run tests to confirm setup works**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected output:
```
PASS  __tests__/StreamUrlCache.test.js
  StreamUrlCache
    ✓ placeholder
```

- [ ] **Step 6: Commit**

```bash
git add package.json babel.config.js __tests__/StreamUrlCache.test.js
git commit -m "test: add jest setup for StreamUrlCache unit tests"
```

---

## Task 2: TDD — `parseStreamUrl`

This pure function extracts the stream URL from the HTML fragment returned by the ORB `?played=1&ajax=1` endpoint.

**Files:**
- Modify: `__tests__/StreamUrlCache.test.js`
- Create: `services/StreamUrlCache.js` (pure function only)

- [ ] **Step 1: Write failing tests for `parseStreamUrl`**

Replace the contents of `__tests__/StreamUrlCache.test.js`:

```javascript
import { parseStreamUrl } from '../services/StreamUrlCache';

describe('parseStreamUrl', () => {
  it('extracts a stream URL from a typical ORB HTML fragment', () => {
    const html = `<button class="b-play station_play" stream="https://stream.zeno.fm/dwxw3p9vea0uv" streamType="mp3" radioId="lb.virginradiolebanon">`;
    expect(parseStreamUrl(html)).toBe('https://stream.zeno.fm/dwxw3p9vea0uv');
  });

  it('extracts a StreamTheWorld redirect URL', () => {
    const html = `<button stream="https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_LEBANONAAC_SC?dist=onlineradiobox" streamType="mp3">`;
    expect(parseStreamUrl(html)).toBe('https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_LEBANONAAC_SC?dist=onlineradiobox');
  });

  it('returns null when stream attribute is empty', () => {
    const html = `<button class="b-play station_play" stream="" streamType="" radioId="lb.nrjlebanon">`;
    expect(parseStreamUrl(html)).toBeNull();
  });

  it('returns null when stream attribute is absent', () => {
    const html = `<button class="b-play station_play" radioId="lb.test">`;
    expect(parseStreamUrl(html)).toBeNull();
  });

  it('returns null for empty string input', () => {
    expect(parseStreamUrl('')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected: FAIL — `Cannot find module '../services/StreamUrlCache'`

- [ ] **Step 3: Create `services/StreamUrlCache.js` with `parseStreamUrl` only**

```javascript
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
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected:
```
PASS  __tests__/StreamUrlCache.test.js
  parseStreamUrl
    ✓ extracts a stream URL from a typical ORB HTML fragment
    ✓ extracts a StreamTheWorld redirect URL
    ✓ returns null when stream attribute is empty
    ✓ returns null when stream attribute is absent
    ✓ returns null for empty string input
```

- [ ] **Step 5: Commit**

```bash
git add services/StreamUrlCache.js __tests__/StreamUrlCache.test.js
git commit -m "feat: add parseStreamUrl with tests"
```

---

## Task 3: TDD — `extractOrbPath` and `getTTL`

**Files:**
- Modify: `__tests__/StreamUrlCache.test.js`
- Modify: `services/StreamUrlCache.js`

- [ ] **Step 1: Add failing tests**

Append to `__tests__/StreamUrlCache.test.js`:

```javascript
import { parseStreamUrl, extractOrbPath, getTTL } from '../services/StreamUrlCache';

// ... existing tests above ...

describe('extractOrbPath', () => {
  it('extracts path from a standard ORB URL', () => {
    expect(extractOrbPath('https://onlineradiobox.com/lb/mixfm/?cs=lb.mixfm&played=1'))
      .toBe('/lb/mixfm/');
  });

  it('extracts path from a p. subdomain ORB URL', () => {
    expect(extractOrbPath('http://p.onlineradiobox.com/lb/deltaradio/player/?cs=lb.deltaradio&played=1'))
      .toBe('/lb/deltaradio/');
  });

  it('handles URL without trailing slash', () => {
    expect(extractOrbPath('https://onlineradiobox.com/lb/mixfm?cs=lb.mixfm'))
      .toBe('/lb/mixfm/');
  });

  it('returns null for non-ORB URLs', () => {
    expect(extractOrbPath('https://stream.zeno.fm/abc')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(extractOrbPath(null)).toBeNull();
  });
});

describe('getTTL', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const WEEK = 7 * DAY;

  it('returns 7-day TTL for stream.zeno.fm URLs', () => {
    expect(getTTL('https://stream.zeno.fm/dwxw3p9vea0uv')).toBe(WEEK);
  });

  it('returns 7-day TTL for StreamTheWorld redirect URLs', () => {
    expect(getTTL('https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_LEBANONAAC_SC')).toBe(WEEK);
  });

  it('returns 24-hour TTL for self-hosted URLs', () => {
    expect(getTTL('https://l3.itworkscdn.net/itwaudio/9030/stream')).toBe(DAY);
  });

  it('returns 24-hour TTL for null', () => {
    expect(getTTL(null)).toBe(DAY);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected: FAIL — `extractOrbPath is not a function`, `getTTL is not a function`

- [ ] **Step 3: Add `extractOrbPath` and `getTTL` to `services/StreamUrlCache.js`**

Append to `services/StreamUrlCache.js` after `parseStreamUrl`:

```javascript
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
 * Returns null if the URL is not an ORB URL.
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
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected:
```
PASS  __tests__/StreamUrlCache.test.js
  parseStreamUrl   ✓ 5 tests
  extractOrbPath   ✓ 5 tests
  getTTL           ✓ 4 tests
```

- [ ] **Step 5: Commit**

```bash
git add services/StreamUrlCache.js __tests__/StreamUrlCache.test.js
git commit -m "feat: add extractOrbPath and getTTL with tests"
```

---

## Task 4: Complete `StreamUrlCache` service

Add the async functions that use AsyncStorage and fetch. These are not unit tested (they depend on network and native storage) — verified manually in Task 7.

**Files:**
- Modify: `services/StreamUrlCache.js`

- [ ] **Step 1: Append the full async API to `services/StreamUrlCache.js`**

Add at the top of the file (before `parseStreamUrl`):

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'stream_cache_';
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;
```

Then append all async functions at the bottom of the file:

```javascript
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
```

- [ ] **Step 2: Run existing tests to confirm nothing broke**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected: same 14 passing tests as before.

- [ ] **Step 3: Commit**

```bash
git add services/StreamUrlCache.js
git commit -m "feat: complete StreamUrlCache with prefetchAll, getUrl, invalidate, refetch"
```

---

## Task 5: Data fixes — `radioStations.js`

**Files:**
- Modify: `data/radioStations.js`

### Step 1: Fix France Inter URL (id: 77)

- [ ] **Find and replace the broken France Inter URL**

In [data/radioStations.js](data/radioStations.js), find id 77 (`France Inter`). Replace the current `url` value:

```javascript
// BEFORE — a rotating .ts segment file, will always break:
url: 'https://stream.radiofrance.fr/accs3/franceinter/prod1transcoder1/franceinter_aac_hifi_4_1253654_1753388839.ts?id=radiofrance',

// AFTER — stable Icecast stream, same pattern as France Info (id:85) and France Culture (id:87):
url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3',
```

### Step 2: Add missing `webViewFallbackUrl` entries

For each station below, verify the ORB page exists first by opening the URL in a browser and confirming it loads a station page. If a slug returns a 404, skip that station (leave it without `webViewFallbackUrl`).

- [ ] **id: 6 — NRJ Radio Lebanon**

Verify: `https://onlineradiobox.com/lb/nrjlebanon/` (confirmed working from our research).

Add after the `url` line of id 6:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/nrjlebanon/?cs=lb.nrjlebanon&played=1',
```

- [ ] **id: 21 — Nostalgie FM**

Verify: `https://onlineradiobox.com/lb/nostalgie/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/nostalgie/?cs=lb.nostalgie&played=1',
```

- [ ] **id: 22 — Voice of Lebanon**

Verify: `https://onlineradiobox.com/lb/voiceoflebanon/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/voiceoflebanon/?cs=lb.voiceoflebanon&played=1',
```

- [ ] **id: 26 — LBI Radio**

Verify: `https://onlineradiobox.com/lb/lbi/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/lbi/?cs=lb.lbi&played=1',
```

- [ ] **id: 28 — Sawt Al Hoda**

Verify: `https://onlineradiobox.com/lb/sawtalhoda/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/sawtalhoda/?cs=lb.sawtalhoda&played=1',
```

- [ ] **id: 30 — Al Nour**

Verify: `https://onlineradiobox.com/lb/alnour/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/alnour/?cs=lb.alnour&played=1',
```

- [ ] **id: 69 — Sawt El Nojoum**

Verify: `https://onlineradiobox.com/lb/sawtelnojoum/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/sawtelnojoum/?cs=lb.sawtelnojoum&played=1',
```

- [ ] **id: 70 — Rotana FM**

Verify: `https://onlineradiobox.com/ae/rotanafm/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/ae/rotanafm/?cs=ae.rotanafm&played=1',
```

- [ ] **id: 73 — NRJ France**

Verify: `https://onlineradiobox.com/fr/nrj/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/fr/nrj/?cs=fr.nrj&played=1',
```

- [ ] **id: 76 — Cherie FM**

Verify: `https://onlineradiobox.com/fr/cheriefm/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/fr/cheriefm/?cs=fr.cheriefm&played=1',
```

- [ ] **id: 83 — Beat FM**

Verify: `https://onlineradiobox.com/lb/beatfm/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/beatfm/?cs=lb.beatfm&played=1',
```

- [ ] **id: 88 — LBI Oldies**

Verify: `https://onlineradiobox.com/lb/lbioldies/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/lbioldies/?cs=lb.lbioldies&played=1',
```

- [ ] **id: 89 — LBI Zaman**

Verify: `https://onlineradiobox.com/lb/lbizaman/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/lbizaman/?cs=lb.lbizaman&played=1',
```

- [ ] **id: 90 — LBI Hits**

Verify: `https://onlineradiobox.com/lb/lbihits/`

Add:
```javascript
webViewFallbackUrl: 'https://onlineradiobox.com/lb/lbihits/?cs=lb.lbihits&played=1',
```

- [ ] **Commit data changes**

```bash
git add data/radioStations.js
git commit -m "fix: add missing webViewFallbackUrls and fix France Inter stream URL"
```

---

## Task 6: Integrate `StreamUrlCache` into `usePlayer.js`

**Files:**
- Modify: `hooks/usePlayer.js`

- [ ] **Step 1: Add the import at the top of `usePlayer.js`**

After the existing imports at the top of [hooks/usePlayer.js](hooks/usePlayer.js), add:

```javascript
import StreamUrlCache from '../services/StreamUrlCache';
```

- [ ] **Step 2: Add `isRetrying` ref**

Inside the `usePlayer` function body, after the existing `useState` calls (around line 26), add:

```javascript
const isRetrying = React.useRef(false);
```

- [ ] **Step 3: Resolve URL before playing in `playStation`**

In `playStation`, find this block (around line 258):

```javascript
// Stop current playback and clear queue
await stopTrack();

// Add the new station and play
await addTrack(station);
await playTrack();
```

Replace it with:

```javascript
// Stop current playback and clear queue
await stopTrack();

// Resolve current stream URL from cache (falls back to station.url if no cache)
const resolvedUrl = await StreamUrlCache.getUrl(station);
const trackToPlay = resolvedUrl ? { ...station, url: resolvedUrl } : station;

// Add the resolved station and play
await addTrack(trackToPlay);
await playTrack();
```

- [ ] **Step 4: Add silent retry in the source error handler**

In the `setErrorCallback` block, find the source error branch (around line 109). It currently reads:

```javascript
} else if (/source error/i.test(error.message)) {
  // ... finds station ...
  if (station) {
    // Automatically open webview immediately without alert
    setStreamError(null);
    console.log('Opening webview automatically for:', station.name || station.title);
    console.log('Final station has webViewFallbackUrl:', !!station.webViewFallbackUrl);
    setTimeout(() => openORBForStation(station), 100);
  } else {
```

Replace **only** the `if (station)` block inside that branch with:

```javascript
  if (station) {
    // Try to get a fresh URL from ORB before falling back to WebView
    if (!isRetrying.current) {
      isRetrying.current = true;
      const freshUrl = await StreamUrlCache.refetch(station);
      if (freshUrl) {
        setStreamError(null);
        console.log('StreamUrlCache: retrying with fresh URL for', station.name);
        setTimeout(async () => {
          await playStation({ ...station, url: freshUrl });
          isRetrying.current = false;
        }, 300);
        return;
      }
      isRetrying.current = false;
    }
    // Fresh URL unavailable or retry already attempted — open WebView
    setStreamError(null);
    console.log('Opening webview automatically for:', station.name || station.title);
    console.log('Final station has webViewFallbackUrl:', !!station.webViewFallbackUrl);
    setTimeout(() => openORBForStation(station), 100);
  } else {
```

- [ ] **Step 5: Also invalidate cache in the source error branch**

In the same `if (station)` block, just before the `if (!isRetrying.current)` check, add:

```javascript
await StreamUrlCache.invalidate(station.id);
```

So the full block now reads:

```javascript
  if (station) {
    // Invalidate the stale cache entry
    await StreamUrlCache.invalidate(station.id);
    // Try to get a fresh URL from ORB before falling back to WebView
    if (!isRetrying.current) {
      isRetrying.current = true;
      const freshUrl = await StreamUrlCache.refetch(station);
      if (freshUrl) {
        setStreamError(null);
        console.log('StreamUrlCache: retrying with fresh URL for', station.name);
        setTimeout(async () => {
          await playStation({ ...station, url: freshUrl });
          isRetrying.current = false;
        }, 300);
        return;
      }
      isRetrying.current = false;
    }
    // Fresh URL unavailable or retry already attempted — open WebView
    setStreamError(null);
    console.log('Opening webview automatically for:', station.name || station.title);
    console.log('Final station has webViewFallbackUrl:', !!station.webViewFallbackUrl);
    setTimeout(() => openORBForStation(station), 100);
  } else {
```

- [ ] **Step 6: Run unit tests to confirm nothing regressed**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected: all 14 tests still pass.

- [ ] **Step 7: Commit**

```bash
git add hooks/usePlayer.js
git commit -m "feat: integrate StreamUrlCache into usePlayer — resolve URLs before play, retry on failure"
```

---

## Task 7: Wire up `prefetchAll` in `App.js`

**Files:**
- Modify: `App.js`

- [ ] **Step 1: Add the import**

In [App.js](App.js), after the existing imports at the top, add:

```javascript
import StreamUrlCache from './services/StreamUrlCache';
```

- [ ] **Step 2: Add the prefetch effect**

In the `App` function body, after the existing `useEffect` for `initializeApp` (around line 117), add a new effect:

```javascript
// Pre-fetch stream URLs from OnlineRadioBox in the background at launch
useEffect(() => {
  StreamUrlCache.prefetchAll(radioStations);
}, []);
```

`radioStations` is already imported at line 44 of `App.js`.

- [ ] **Step 3: Run unit tests**

```bash
npx jest --testPathPattern=StreamUrlCache
```

Expected: all 14 tests pass.

- [ ] **Step 4: Commit**

```bash
git add App.js
git commit -m "feat: trigger StreamUrlCache prefetch on app launch"
```

---

## Task 8: Manual verification

- [ ] **Step 1: Build and run the app**

```bash
npx expo start
```

Open on a device or emulator.

- [ ] **Step 2: Check background prefetch runs**

In the Metro bundler console, within ~5 seconds of app launch you should see log lines like:
```
StreamUrlCache: prefetch failed for [station name]: ...
```
(only for stations where ORB returns empty stream — expected for NRJ Lebanon)

No errors or crashes.

- [ ] **Step 3: Play Mix FM (StreamTheWorld station)**

Tap Mix FM. It should play. In the console, confirm the URL used starts with `playerservices.streamtheworld.com` (from cache), not `25683.live.streamtheworld.com` (hardcoded).

- [ ] **Step 4: Play Virgin Radio Lebanon (Zeno.fm station)**

Tap Virgin Radio Lebanon. It should play without a JWT expiry error. Console URL should be `stream.zeno.fm/dwxw3p9vea0uv` (no JWT).

- [ ] **Step 5: Verify France Inter plays**

Tap France Inter. It should play using the new `icecast.radiofrance.fr/franceinter-midfi.mp3` URL.

- [ ] **Step 6: Simulate a cache miss**

In a simulator, clear app data (or temporarily modify `getUrl` to always return `null`), relaunch, tap a Zeno.fm station. It should:
1. Attempt to play the hardcoded (expired JWT) URL
2. Get a source error
3. Silently refetch from ORB
4. Retry with the clean URL
5. Play successfully — no WebView opened

- [ ] **Final commit**

```bash
git add .
git commit -m "feat: stream URL auto-resolver complete"
```

---

## Self-Review

**Spec coverage:**
- ✓ `StreamUrlCache` service with `prefetchAll`, `getUrl`, `invalidate`, `refetch` — Task 4
- ✓ TTL rules (7-day for Zeno/StreamTheWorld, 24hr for others) — Task 3 + 4
- ✓ ORB slug extraction from `webViewFallbackUrl` — Task 3
- ✓ Batch size 5, 200ms gap — Task 4
- ✓ Add 14 missing `webViewFallbackUrl` entries with verification step — Task 5
- ✓ Fix France Inter URL — Task 5
- ✓ `usePlayer.js` uses cached URL before playing — Task 6
- ✓ Error callback: invalidate + refetch + one retry — Task 6
- ✓ `isRetrying` ref prevents infinite retry loops — Task 6
- ✓ `App.js` fires `prefetchAll` at launch — Task 7
- ✓ Institutional CDN stations (ids 67, 71, 74, 75, 78, 79, 85, 86, 87) — no changes needed, handled by hardcoded fallback

**Type consistency:**
- `StreamUrlCache.getUrl(station)` — used in Task 6 ✓
- `StreamUrlCache.invalidate(station.id)` — used in Task 6 ✓
- `StreamUrlCache.refetch(station)` — used in Task 6 ✓
- `StreamUrlCache.prefetchAll(radioStations)` — used in Task 7 ✓
- All match the exports defined in Task 4 ✓
