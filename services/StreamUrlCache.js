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
