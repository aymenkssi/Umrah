import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Coords } from './location';
import { computePrayerTimes } from './prayer';

export const NOTIFIABLE_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type NotifiablePrayer = (typeof NOTIFIABLE_PRAYERS)[number];

export const OFFSETS = [0, 5, 10, 15, 30] as const;
export type OffsetMinutes = (typeof OFFSETS)[number];

export interface NotificationSettings {
  enabled: boolean;
  prayers: Record<NotifiablePrayer, boolean>;
  /** Minutes before the prayer time (0 = at the time). */
  offset: OffsetMinutes;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  offset: 0,
};

export const STORAGE_KEY = 'prayer_notifications';
export const CHANNEL_ID = 'prayer-times';
/** Days scheduled ahead; they are refreshed each time the app opens. */
const DAYS_AHEAD = 5;
/** iOS keeps at most 64 pending notifications per app. */
const MAX_SCHEDULED = 60;

export function parseNotificationSettings(raw: string | null): NotificationSettings {
  try {
    const p = raw ? JSON.parse(raw) : null;
    if (!p || typeof p !== 'object') return DEFAULT_NOTIFICATION_SETTINGS;
    const prayers = { ...DEFAULT_NOTIFICATION_SETTINGS.prayers };
    for (const name of NOTIFIABLE_PRAYERS) {
      if (typeof p.prayers?.[name] === 'boolean') prayers[name] = p.prayers[name];
    }
    return {
      enabled: p.enabled === true,
      prayers,
      offset: (OFFSETS as readonly number[]).includes(p.offset) ? p.offset : 0,
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export interface ScheduledPrayer {
  prayer: NotifiablePrayer;
  prayerTime: Date;
  fireAt: Date;
}

/** Pure: the reminders to schedule from `now` for the next few days. */
export function buildSchedule(
  coords: Coords,
  settings: NotificationSettings,
  now: Date = new Date(),
  days: number = DAYS_AHEAD
): ScheduledPrayer[] {
  if (!settings.enabled) return [];
  const result: ScheduledPrayer[] = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    const { times } = computePrayerTimes(coords.latitude, coords.longitude, date);
    for (const prayer of NOTIFIABLE_PRAYERS) {
      if (!settings.prayers[prayer]) continue;
      const prayerTime = times[prayer];
      const fireAt = new Date(prayerTime.getTime() - settings.offset * 60 * 1000);
      if (fireAt.getTime() > now.getTime()) result.push({ prayer, prayerTime, fireAt });
    }
  }
  return result.slice(0, MAX_SCHEDULED);
}

export const notificationsSupported = Platform.OS === 'android' || Platform.OS === 'ios';

/** Shows reminders as banners even when the app is open. Called once at start-up. */
export function configureNotificationHandler(): void {
  if (!notificationsSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(channelName: string): Promise<boolean> {
  if (!notificationsSupported) return false;
  if (Platform.OS === 'android') {
    // The channel must exist before Android 13+ shows the permission prompt.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: channelName,
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export interface NotificationTexts {
  prayerName: (prayer: NotifiablePrayer) => string;
  atTime: string;
  before: (minutes: number) => string;
  formatTime: (date: Date) => string;
}

/** Replaces every pending prayer reminder with a fresh schedule. */
export async function reschedulePrayerNotifications(
  coords: Coords | null,
  settings: NotificationSettings,
  texts: NotificationTexts
): Promise<number> {
  if (!notificationsSupported) return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!coords || !settings.enabled) return 0;
  const schedule = buildSchedule(coords, settings);
  for (const item of schedule) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${texts.prayerName(item.prayer)} · ${texts.formatTime(item.prayerTime)}`,
        body: settings.offset ? texts.before(settings.offset) : texts.atTime,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.fireAt,
        channelId: CHANNEL_ID,
      },
    });
  }
  return schedule.length;
}
