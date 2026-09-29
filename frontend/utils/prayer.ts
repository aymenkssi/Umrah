import { CalculationMethod, CalculationParameters, Coordinates, PrayerTimes } from 'adhan';

export const PRAYER_NAMES = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export type CalculationMethodKey = 'umm_al_qura' | 'mwl';

/**
 * Rough bounding box of Saudi Arabia. Pilgrims there should see the official
 * Umm al-Qura times used by the Haramain; elsewhere we use the Muslim World League.
 */
export function isInSaudiArabia(latitude: number, longitude: number): boolean {
  return latitude >= 16 && latitude <= 32.5 && longitude >= 34.5 && longitude <= 55.7;
}

export function getCalculationMethodKey(latitude: number, longitude: number): CalculationMethodKey {
  return isInSaudiArabia(latitude, longitude) ? 'umm_al_qura' : 'mwl';
}

function getCalculationParameters(key: CalculationMethodKey): CalculationParameters {
  return key === 'umm_al_qura' ? CalculationMethod.UmmAlQura() : CalculationMethod.MuslimWorldLeague();
}

export function computePrayerTimes(latitude: number, longitude: number, date: Date = new Date()) {
  const method = getCalculationMethodKey(latitude, longitude);
  const times = new PrayerTimes(
    new Coordinates(latitude, longitude),
    date,
    getCalculationParameters(method)
  );
  return { times, method };
}

export interface NextPrayer {
  name: PrayerName;
  time: Date;
}

/**
 * Returns the first prayer strictly after `now`. After Isha, it is tomorrow's Fajr.
 */
export function getNextPrayer(
  today: Record<PrayerName, Date>,
  tomorrowFajr: Date,
  now: Date = new Date()
): NextPrayer {
  for (const name of PRAYER_NAMES) {
    if (today[name].getTime() > now.getTime()) {
      return { name, time: today[name] };
    }
  }
  return { name: 'fajr', time: tomorrowFajr };
}
