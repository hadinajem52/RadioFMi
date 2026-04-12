import { resetConnectivityProbeCache, testInternetConnectivity } from '../utils/networkUtils';

describe('testInternetConnectivity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetConnectivityProbeCache();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses cached probe result within ttl window', async () => {
    global.fetch.mockResolvedValue({ status: 204 });

    const firstResult = await testInternetConnectivity();
    const secondResult = await testInternetConnectivity();

    expect(firstResult).toBe(true);
    expect(secondResult).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('clears timeout even when probe fails', async () => {
    global.fetch.mockRejectedValue(new Error('probe failed'));

    const result = await testInternetConnectivity({ force: true });
    expect(result).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });
});
