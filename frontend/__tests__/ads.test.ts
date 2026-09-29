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

describe('app.json', () => {
  it('keeps the root react-native-google-mobile-ads section in sync with the Expo plugin', () => {
    // The library's Gradle script (android/app-json.gradle) crashes the Android build when
    // this root section is missing, even though the Expo plugin is configured.
    const appJson = require('../app.json');
    const plugin = appJson.expo.plugins.find(
      (p: unknown) => Array.isArray(p) && p[0] === 'react-native-google-mobile-ads'
    )[1];
    expect(appJson['react-native-google-mobile-ads']).toEqual({
      android_app_id: plugin.androidAppId,
      ios_app_id: plugin.iosAppId,
      delay_app_measurement_init: plugin.delayAppMeasurementInit,
    });
  });
});
