import {
  computePrayerTimes,
  getCalculationMethodKey,
  getNextPrayer,
  PRAYER_NAMES,
  PrayerName,
} from '../utils/prayer';

describe('getCalculationMethodKey', () => {
  it('uses Umm al-Qura in Makkah and Madinah', () => {
    expect(getCalculationMethodKey(21.4225, 39.8262)).toBe('umm_al_qura');
    expect(getCalculationMethodKey(24.4672, 39.6111)).toBe('umm_al_qura');
  });

  it('uses the Muslim World League elsewhere', () => {
    expect(getCalculationMethodKey(48.8566, 2.3522)).toBe('mwl');
    expect(getCalculationMethodKey(36.8065, 10.1815)).toBe('mwl');
  });
});

describe('computePrayerTimes', () => {
  it('returns the six times in chronological order', () => {
    const { times } = computePrayerTimes(21.4225, 39.8262, new Date(2026, 0, 15));
    const values = PRAYER_NAMES.map((name) => times[name].getTime());
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

describe('getNextPrayer', () => {
  const day = (h: number, m = 0) => new Date(2026, 0, 15, h, m);
  const today: Record<PrayerName, Date> = {
    fajr: day(5, 30),
    sunrise: day(6, 50),
    dhuhr: day(12, 30),
    asr: day(15, 40),
    maghrib: day(18, 5),
    isha: day(19, 35),
  };
  const tomorrowFajr = new Date(2026, 0, 16, 5, 31);

  it('returns the first upcoming prayer', () => {
    expect(getNextPrayer(today, tomorrowFajr, day(13)).name).toBe('asr');
  });

  it('does not return a prayer whose time is exactly now', () => {
    expect(getNextPrayer(today, tomorrowFajr, day(12, 30)).name).toBe('asr');
  });

  it("returns tomorrow's Fajr after Isha", () => {
    const next = getNextPrayer(today, tomorrowFajr, day(22));
    expect(next.name).toBe('fajr');
    expect(next.time).toBe(tomorrowFajr);
  });
});
