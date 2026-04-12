# Stream URL Auto-Resolver Design

**Date:** 2026-04-12
**Status:** Approved

## Problem

Radio station stream URLs expire or become unreliable over time:
- Zeno.fm URLs embed short-lived JWT tokens that expire in ~60 seconds after they are copied
- StreamTheWorld URLs reference specific CDN server numbers (e.g. `25683.live.streamtheworld.com`) that rotate
- Self-hosted station CDN URLs change when operators switch providers

Currently, broken URLs require manual discovery and editing of `radioStations.js`. The goal is to make URLs self-healing with zero manual intervention.

## Research Findings

OnlineRadioBox (ORB) maintains always-working stream URLs using:
1. Broadcaster-maintained listings (stations update their own ORB page)
2. CDN API partnerships (Zeno.fm, StreamTheWorld) — real-time URL generation
3. Automated scraping of station websites when CDN partnerships don't exist

**Key API discovered:**
```
GET https://onlineradiobox.com/{country}/{slug}/?played=1&ajax=1
```
Returns an HTML fragment containing the current stream URL in a play button attribute:
```html
<button class="b-play station_play" stream="https://stream.zeno.fm/dwxw3p9vea0uv" ...>
```

Confirmed working for:
- Zeno.fm stations: returns `stream.zeno.fm/{id}` (base URL, no JWT — permanently valid)
- StreamTheWorld stations: returns `playerservices.streamtheworld.com/api/livestream-redirect/{name}` (redirect URL, permanently valid)
- Self-hosted stations: returns current working URL

## Chosen Approach: Smart Tiered Resolver (Approach B)

Stations are divided into three tiers based on URL stability:

| Tier | Examples | Strategy |
|---|---|---|
| Dynamic | Zeno.fm, some self-hosted (~74 stations) | ORB pre-fetch + AsyncStorage cache |
| Institutional CDN | radiofrance.fr, bfmtv.com, infomaniak.ch, skynewsarabia.com (9 stations) | Hardcoded — broadcaster-owned CDN, effectively permanent |
| Missing ORB link | 14 Lebanese/regional stations | Add `webViewFallbackUrl` one-time, then same as Dynamic tier |

## Architecture

### New file: `services/StreamUrlCache.js`

Responsibilities:
- `prefetchAll(stations)` — fires on app launch, background, no UI blocking
- `getUrl(station)` — returns cached URL or `null`
- `invalidate(stationId)` — clears cache entry on playback failure
- `refetch(station)` — fetches fresh URL from ORB after invalidation

### Modified: `hooks/usePlayer.js`

`playStation()` resolves URL before playing:
```
resolvedUrl = StreamUrlCache.getUrl(station)
trackToPlay = resolvedUrl ? { ...station, url: resolvedUrl } : station
```

Error callback extended with one silent retry before opening WebView:
```
source error → invalidate → refetch → retry once → if still fails → WebView
```

### Modified: `App.js`

One fire-and-forget call after player setup:
```js
StreamUrlCache.prefetchAll(radioStations);
```

### Modified: `data/radioStations.js`

- Add `webViewFallbackUrl` to 14 stations missing it
- Fix France Inter URL (broken `.ts` segment → stable Icecast URL)

## Data Changes

### Stations receiving `webViewFallbackUrl` (one-time fix)

| id | Station | ORB slug |
|---|---|---|
| 6 | NRJ Radio | `lb/nrjlebanon` |
| 21 | Nostalgie FM | `lb/nostalgie` |
| 22 | Voice of Lebanon | `lb/voiceoflebanon` |
| 26 | LBI Radio | `lb/lbi` |
| 28 | Sawt Al Hoda | `lb/sawt-al-hoda` |
| 30 | Al Nour | `lb/alnour` |
| 69 | Sawt El Nojoum | `lb/sawtelnojoum` |
| 70 | Rotana FM | `ae/rotanafm` |
| 73 | NRJ France | `fr/nrj` |
| 76 | Cherie FM | `fr/cheriefm` |
| 83 | Beat FM | `lb/beatfm` |
| 88 | LBI Oldies | `lb/lbioldies` |
| 89 | LBI Zaman | `lb/lbizaman` |
| 90 | LBI Hits | `lb/lbihits` |

> Each slug must be verified against ORB before adding. If a slug returns a 404 or empty stream, skip it and leave the station on hardcoded fallback.

### France Inter URL fix (id: 77)

- **Current (broken):** `https://stream.radiofrance.fr/accs3/franceinter/prod1transcoder1/franceinter_aac_hifi_4_1253654_1753388839.ts?id=radiofrance`
- **Replacement:** `https://icecast.radiofrance.fr/franceinter-midfi.mp3`

### Institutional CDN stations (no change, no ORB resolver)

ids: 67, 71, 74, 75, 78, 79, 85, 86, 87

## `StreamUrlCache` Service Specification

### AsyncStorage cache key
```
stream_cache_{stationId}
```

### Cache entry schema
```json
{
  "url": "https://stream.zeno.fm/dwxw3p9vea0uv",
  "fetchedAt": 1712345678000,
  "source": "orb"
}
```

### TTL rules
| URL type | TTL |
|---|---|
| `stream.zeno.fm` | 7 days |
| `playerservices.streamtheworld.com` | 7 days |
| Everything else | 24 hours |

### ORB slug extraction

Extract country/slug path from `webViewFallbackUrl`:
- `https://onlineradiobox.com/lb/mixfm/?cs=...` → `/lb/mixfm/`
- `http://p.onlineradiobox.com/lb/deltaradio/player/?cs=...` → `/lb/deltaradio/`

Regex: match path segments between the domain and `?` or `/player/`.

### URL parsing from ORB response

Extract stream URL from HTML attribute using string search:
```
find: stream="
extract: everything between stream=" and the next "
if empty string → return null
```

### Concurrency

`prefetchAll` processes stations in batches of 5 with 200ms between batches. ~89 stations completes in under 4 seconds without overwhelming the network.

Stations without `webViewFallbackUrl` are skipped silently.

### Error handling in prefetchAll

Each station fetch is wrapped in try/catch. A failure for one station does not affect others. Errors are logged, not thrown.

## Fallback Chain (complete)

```
User taps station
  │
  ├─ cached URL, still fresh → play ✓
  │
  ├─ no cache (first launch or expired)
  │    └─ use station.url (hardcoded) → play
  │         └─ fails → invalidate + refetch from ORB
  │              ├─ got URL → retry once → play ✓
  │              └─ no URL / retry fails → open WebView ✓
  │
  └─ cached URL fails (went stale)
       └─ invalidate + refetch from ORB
            ├─ got URL → retry once → play ✓
            └─ no URL / retry fails → open WebView ✓
```

Network offline: caught by existing `hasGoodConnection()` check before resolver is ever called.

One retry maximum per failure — prevents infinite retry loops.

## Files Changed

| File | Type | Change |
|---|---|---|
| `services/StreamUrlCache.js` | New | Full resolver service |
| `hooks/usePlayer.js` | Modified | ~15 lines in `playStation()` and error callback |
| `App.js` | Modified | 2 lines — fire prefetchAll on startup |
| `data/radioStations.js` | Modified | Add 14 `webViewFallbackUrl` entries + fix France Inter URL |

## Files Not Changed

`TrackPlayerService.js`, `webViewFallback.js`, all components, all other hooks — zero changes.
