import { Alert, Linking } from 'react-native';

let opener = null;

export const registerWebViewOpener = (fn) => {
  opener = fn;
};

export const openWebView = (url, title = 'Web Player') => {
  if (opener) {
    opener(url, title);
  } else {
    // Fallback: prompt to open in external browser
    Alert.alert(title, 'Open in browser?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(url) }
    ]);
  }
};

// Build OnlineRadioBox URL using best-effort slug from station name
// Helpers for slug detection
const stripDiacritics = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeSpaces = (s) => s.replace(/\s+/g, ' ').trim();
const alnum = (s) => s.replace(/[^a-z0-9]+/g, '');

// Phrase-based mappings (regex pattern -> slug)
const PHRASE_MAPPINGS = [
  [/^la\s+voix\s+du\s+liban$/, 'voixduliban'],
  [/^voix\s+du\s+liban$/, 'voixduliban'],
  [/^voice\s+of\s+lebanon$/, 'voiceoflebanon'],
  [/^sawt\s+el\s+gh?ad$/, 'sawtelghad'],
  [/^sawt\s+el\s+mada$/, 'sawtelmada'],
  [/^al\s*nour$/, 'alnour'],
  [/^nostalgie(\s*fm)?$/, 'nostalgie'],
  [/^light\s*fm$/, 'lightfm'],
  [/^mix\s*fm$/, 'mix'],
  [/^radio\s+souvenirs$/, 'souvenirs'],
  [/^souvenirs$/, 'souvenirs'],
  [/^radio\s+orient$/, 'orient'],
  [/^virgin(\s*radio)?$/, 'virginradio'],
  [/^nrj(\s*radio)?$/, 'nrj'],
];

// Known slugs lookup (normalized joined name -> slug)
const KNOWN_SLUGS = new Map(
  [
    ['radiosouvenirs', 'souvenirs'],
    ['souvenirs', 'souvenirs'],
    ['mixfm', 'mix'],
    ['lightfm', 'lightfm'],
    ['radiodelta', 'delta'],
    ['sawtelghad', 'sawtelghad'],
    ['sawtelmada', 'sawtelmada'],
    ['voiceoflebanon', 'voiceoflebanon'],
    ['lavoixduliban', 'voixduliban'],
    ['voixduliban', 'voixduliban'],
    ['alnour', 'alnour'],
    ['nostalgiefm', 'nostalgie'],
    ['nostalgie', 'nostalgie'],
    ['radioorient', 'orient'],
    ['virginradio', 'virginradio'],
    ['nrjradio', 'nrj'],
    ['nrj', 'nrj'],
  ]
);

const deriveSlugCandidates = (station) => {
  const raw = String(station?.name || '').toLowerCase();
  const cleaned = normalizeSpaces(stripDiacritics(raw));
  const joined = alnum(cleaned);

  // Try phrase mappings first
  for (const [pattern, slug] of PHRASE_MAPPINGS) {
    if (pattern.test(cleaned)) return [slug];
  }

  const candidates = [];

  // Known lookup by joined form
  if (KNOWN_SLUGS.has(joined)) candidates.push(KNOWN_SLUGS.get(joined));

  // Split into words and remove common stop words progressively
  const stop = new Set(['radio', 'fm', 'lebanon', 'lb', 'the']);
  const words = cleaned.split(' ').filter(Boolean);
  const wordsNoStop = words.filter(w => !stop.has(w));

  const base = alnum(words.join(' ')); // keep fm if present
  const baseNoStop = alnum(wordsNoStop.join(' '));

  const withoutFm = base.replace(/fm$/i, '');
  const withoutFmStop = baseNoStop.replace(/fm$/i, '');

  // Add layered candidates from most specific to most generic
  [
    baseNoStop,
    withoutFmStop,
    base,
    withoutFm,
    wordsNoStop[0] || '',
  ].forEach((c) => {
    const v = c.trim();
    if (v && !candidates.includes(v)) candidates.push(v);
  });

  // Last resort
  if (candidates.length === 0) candidates.push('station');
  return candidates;
};

export const buildOnlineRadioBoxUrl = (station, countryCode = 'lb') => {
  // Prefer webViewFallbackUrl if it exists
  if (station?.webViewFallbackUrl) {
    console.log('Using webViewFallbackUrl:', station.webViewFallbackUrl);
    return station.webViewFallbackUrl;
  }
  
  // Otherwise, build URL from station name
  const candidates = deriveSlugCandidates(station);
  const slug = candidates[0] || 'station';
  const cs = `${countryCode}.${slug}`;
  const builtUrl = `https://onlineradiobox.com/${countryCode}/${slug}/?cs=${cs}&played=1`;
  console.log('Built OnlineRadioBox URL:', builtUrl);
  return builtUrl;
};

export const openORBForStation = (station) => {
  const url = buildOnlineRadioBoxUrl(station);
  const title = station?.name ? `Web Player · ${station.name}` : 'Web Player';
  openWebView(url, title);
};
