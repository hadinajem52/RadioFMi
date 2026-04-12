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

import { extractOrbPath, getTTL } from '../services/StreamUrlCache';

describe('extractOrbPath', () => {
  it('extracts path from a standard ORB URL', () => {
    expect(extractOrbPath('https://onlineradiobox.com/lb/mixfm/?cs=lb.mixfm&played=1'))
      .toBe('/lb/mixfm/');
  });

  it('extracts path from a p. subdomain ORB URL', () => {
    expect(extractOrbPath('http://p.onlineradiobox.com/lb/deltaradio/player/?cs=lb.deltaradio&played=1'))
      .toBe('/lb/deltaradio/');
  });

  it('handles URL without trailing slash before query', () => {
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
