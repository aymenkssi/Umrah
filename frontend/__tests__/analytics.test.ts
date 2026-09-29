import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadAnalyticsEnabled, setAnalyticsEnabled, startSession, trackScreen } from '../utils/analytics';

describe('analytics', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it('is enabled by default and remembers an opt-out', async () => {
    expect(await loadAnalyticsEnabled()).toBe(true);
    await setAnalyticsEnabled(false);
    expect(await loadAnalyticsEnabled()).toBe(false);
    await setAnalyticsEnabled(true);
    expect(await loadAnalyticsEnabled()).toBe(true);
  });

  it('never sends anything from development builds', async () => {
    // Jest runs with __DEV__ = true, like `expo start`.
    await startSession('fr');
    trackScreen('guide');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
