jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import StreamUrlCache, { getTTL } from '../services/StreamUrlCache';

const buildOrbResponse = (streamUrl) =>
  JSON.stringify({
    data: `<button stream="${streamUrl}" streamType="mp3"></button>`,
  });

describe('StreamUrlCache prefetch and stale eviction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => buildOrbResponse('https://stream.zeno.fm/test-stream'),
    });
  });

  it('prefetches only bounded prioritized stations', async () => {
    const stations = [
      { id: 1, name: 'One', webViewFallbackUrl: 'https://onlineradiobox.com/lb/one/?cs=lb.one' },
      { id: 2, name: 'Two', webViewFallbackUrl: 'https://onlineradiobox.com/lb/two/?cs=lb.two' },
      { id: 3, name: 'Three', webViewFallbackUrl: 'https://onlineradiobox.com/lb/three/?cs=lb.three' },
    ];

    await StreamUrlCache.prefetchAll(stations, { limit: 2, priorityStationIds: [3] });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[0][0]).toContain('/lb/three/');
  });

  it('evicts stale cache entries on read miss', async () => {
    const staleEntry = {
      url: 'https://stream.zeno.fm/old-stream',
      fetchedAt: Date.now() - getTTL('https://stream.zeno.fm/old-stream') - 5000,
      source: 'orb',
    };

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(staleEntry));

    const station = { id: 99, webViewFallbackUrl: 'https://onlineradiobox.com/lb/stale/?cs=lb.stale' };
    const cachedUrl = await StreamUrlCache.getUrl(station);

    expect(cachedUrl).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('stream_cache_99');
  });
});
