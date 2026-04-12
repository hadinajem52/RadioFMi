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
