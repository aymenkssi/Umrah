import {
  buildSchedule,
  DEFAULT_NOTIFICATION_SETTINGS,
  parseNotificationSettings,
} from '../utils/prayerNotifications';
import { computePrayerTimes } from '../utils/prayer';

const MAKKAH = { latitude: 21.4225, longitude: 39.8262 };
const enabled = { ...DEFAULT_NOTIFICATION_SETTINGS, enabled: true };

describe('buildSchedule', () => {
  it('schedules nothing when reminders are off', () => {
    expect(buildSchedule(MAKKAH, DEFAULT_NOTIFICATION_SETTINGS)).toEqual([]);
  });

  it('schedules the five prayers for each day, in the future only', () => {
    const now = new Date(2026, 0, 15, 0, 1);
    const items = buildSchedule(MAKKAH, enabled, now, 2);
    expect(items).toHaveLength(10);
    expect(items.every((i) => i.fireAt.getTime() > now.getTime())).toBe(true);
    expect(items.map((i) => i.prayer).slice(0, 5)).toEqual(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
  });

  it('skips prayers already passed today and disabled prayers', () => {
    // One minute after Dhuhr, whatever the time zone running the tests.
    const { times } = computePrayerTimes(MAKKAH.latitude, MAKKAH.longitude, new Date(2026, 0, 15));
    const now = new Date(times.dhuhr.getTime() + 60 * 1000);
    const settings = { ...enabled, prayers: { ...enabled.prayers, isha: false } };
    const items = buildSchedule(MAKKAH, settings, now, 1);
    expect(items.map((i) => i.prayer)).toEqual(['asr', 'maghrib']);
  });

  it('fires the reminder before the prayer with an offset', () => {
    const now = new Date(2026, 0, 15, 0, 1);
    const [first] = buildSchedule(MAKKAH, { ...enabled, offset: 10 }, now, 1);
    expect(first.prayerTime.getTime() - first.fireAt.getTime()).toBe(10 * 60 * 1000);
  });

  it('stays under the iOS limit of 64 pending notifications', () => {
    expect(buildSchedule(MAKKAH, enabled, new Date(2026, 0, 15), 30).length).toBeLessThanOrEqual(60);
  });
});

describe('parseNotificationSettings', () => {
  it('falls back to defaults on invalid data', () => {
    expect(parseNotificationSettings('oops')).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    expect(parseNotificationSettings(JSON.stringify({ enabled: true, offset: 7 })).offset).toBe(0);
  });

  it('keeps valid saved values', () => {
    const saved = { enabled: true, offset: 15, prayers: { fajr: false } };
    const parsed = parseNotificationSettings(JSON.stringify(saved));
    expect(parsed.enabled).toBe(true);
    expect(parsed.offset).toBe(15);
    expect(parsed.prayers.fajr).toBe(false);
    expect(parsed.prayers.isha).toBe(true);
  });
});
