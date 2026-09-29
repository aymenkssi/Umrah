import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';
import type { Coords } from '../utils/location';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
  STORAGE_KEY,
  configureNotificationHandler,
  notificationsSupported,
  parseNotificationSettings,
  requestNotificationPermission,
  reschedulePrayerNotifications,
} from '../utils/prayerNotifications';

const COORDS_KEY = 'last_coords';

interface NotificationsContextType {
  supported: boolean;
  settings: NotificationSettings;
  /** Returns false when the user refused the notification permission. */
  updateSettings: (next: NotificationSettings) => Promise<boolean>;
  /** Latest device position, used to compute the reminder times. */
  setCoords: (coords: Coords) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

configureNotificationHandler();

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [coords, setCoordsState] = useState<Coords | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(COORDS_KEY)])
      .then(([rawSettings, rawCoords]) => {
        setSettings(parseNotificationSettings(rawSettings));
        try {
          const c = rawCoords ? JSON.parse(rawCoords) : null;
          if (typeof c?.latitude === 'number' && typeof c?.longitude === 'number') {
            // A fresh position may already have arrived from a screen: keep it.
            setCoordsState((prev) => prev ?? c);
          }
        } catch {
          // Ignore a corrupted cache.
        }
      })
      .catch((error) => console.error('Error loading notification settings:', error))
      .finally(() => setLoaded(true));
  }, []);

  const setCoords = useCallback((next: Coords) => {
    setCoordsState((prev) => {
      // Reschedule only when the user actually moved (about 1 km).
      if (prev && Math.abs(prev.latitude - next.latitude) < 0.01 && Math.abs(prev.longitude - next.longitude) < 0.01) {
        return prev;
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback(
    async (next: NotificationSettings) => {
      if (next.enabled && !settings.enabled) {
        const granted = await requestNotificationPermission(t('notifications_channel')).catch(() => false);
        if (!granted) return false;
      }
      setSettings(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    },
    [settings.enabled, t]
  );

  useEffect(() => {
    if (loaded && coords) AsyncStorage.setItem(COORDS_KEY, JSON.stringify(coords)).catch(() => {});
  }, [loaded, coords]);

  // Refresh the reminders at launch and whenever settings, position or language change.
  useEffect(() => {
    if (!loaded || !notificationsSupported) return;
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-GB';
    reschedulePrayerNotifications(coords, settings, {
      prayerName: (prayer) => t(prayer),
      atTime: t('notif_now'),
      before: (minutes) => t('notif_before').replace('{n}', String(minutes)),
      formatTime: (date) => date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false }),
    }).catch((error) => console.error('Error scheduling prayer notifications:', error));
  }, [loaded, coords, settings, language, t]);

  const value = useMemo(
    () => ({ supported: notificationsSupported, settings, updateSettings, setCoords }),
    [settings, updateSettings, setCoords]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const usePrayerNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('usePrayerNotifications must be used within NotificationsProvider');
  }
  return context;
};
