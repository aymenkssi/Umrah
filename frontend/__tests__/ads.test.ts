import { getBannerAdUnitId, AdsModule } from '../utils/ads';

jest.mock('../constants/ads', () => ({
  ADS_ENABLED: true,
  BANNER_AD_UNIT_IDS: { android: 'ca-app-pub-1111/2222', ios: 'ca-app-pub-3333/4444' },
}));

const fakeAds = { TestIds: { ADAPTIVE_BANNER: 'test-banner' } } as unknown as AdsModule;

describe('getBannerAdUnitId', () => {
  it('always uses Google test ads in development builds', () => {
    // Jest runs with __DEV__ = true, like a development build.
    expect(getBannerAdUnitId(fakeAds)).toBe('test-banner');
  });
});
