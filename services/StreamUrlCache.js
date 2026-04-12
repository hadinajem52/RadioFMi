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
