/**
 * AdMob configuration.
 *
 * To go live, create your ad units in https://apps.admob.com and replace the values below:
 *  - BANNER_AD_UNIT_IDS: the "Banner" ad unit IDs (format ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN).
 *  - The App IDs (format ca-app-pub-XXXXXXXXXXXXXXXX~NNNNNNNNNN) go in app.json, under the
 *    "react-native-google-mobile-ads" plugin (androidAppId / iosAppId).
 *
 * While a value is left empty, or in development builds, Google's official test ads are shown.
 * Never click your own real ads: it can get the AdMob account suspended.
 */
export const BANNER_AD_UNIT_IDS = {
  android: '',
  ios: '',
};

/** Set to false to turn every ad off without touching the screens. */
export const ADS_ENABLED = true;
