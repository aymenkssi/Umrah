import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, Palette } from '../../constants/theme';
import { AdBanner } from '../../components/AdBanner';
import { formatTimeRemaining } from '../../utils/calculations';
import { useCoords } from '../../hooks/useCoords';
import { computePrayerTimes, getNextPrayer, PRAYER_NAMES, PrayerName } from '../../utils/prayer';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';
import { usePrayerNotifications } from '../../contexts/NotificationsContext';
import { NOTIFIABLE_PRAYERS, NotifiablePrayer, OFFSETS, NotificationSettings } from '../../utils/prayerNotifications';

const isNotifiable = (name: PrayerName): name is NotifiablePrayer =>
  (NOTIFIABLE_PRAYERS as readonly string[]).includes(name);

const openExactAlarmSettings = () => {
  const pkg = Constants.expoConfig?.android?.package;
  IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM, {
    data: pkg ? `package:${pkg}` : undefined,
  }).catch((error) => console.error('Cannot open alarm settings:', error));
};

const PRAYER_ICONS: Record<PrayerName, keyof typeof Ionicons.glyphMap> = {
  fajr: 'moon-outline',
  sunrise: 'sunny-outline',
  dhuhr: 'sunny',
  asr: 'partly-sunny-outline',
  maghrib: 'cloudy-night-outline',
  isha: 'moon',
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function PrayerTimesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const { status, coords, retry } = useCoords();
  const [now, setNow] = useState(new Date());
  const notifications = usePrayerNotifications();
  const { setCoords } = notifications;

  useEffect(() => {
    if (coords) setCoords(coords);
  }, [coords, setCoords]);

  const saveNotifications = async (next: NotificationSettings) => {
    const ok = await notifications.updateSettings(next);
    if (!ok) Alert.alert(t('notifications'), t('notifications_denied'));
  };

  const togglePrayerReminder = (prayer: NotifiablePrayer) => {
    const current = notifications.settings;
    const on = current.enabled && current.prayers[prayer];
    saveNotifications({
      ...current,
      // Turning one prayer on also turns reminders on.
      enabled: on ? current.enabled : true,
      prayers: { ...current.prayers, [prayer]: !on },
    });
  };

  useEffect(() => {
    // Refresh every 30s so the countdown and the highlighted prayer stay accurate.
    const timer = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    retry();
    setNow(new Date());
  };

  // Recomputed when the day changes, not on every tick.
  const dayKey = startOfDay(now).getTime();
  const schedule = useMemo(() => {
    if (!coords) return null;
    const day = new Date(dayKey);
    const tomorrow = new Date(dayKey);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = computePrayerTimes(coords.latitude, coords.longitude, day);
    const next = computePrayerTimes(coords.latitude, coords.longitude, tomorrow);
    return { today: today.times, method: today.method, tomorrowFajr: next.times.fajr };
  }, [coords, dayKey]);

  const nextPrayer = schedule ? getNextPrayer(schedule.today, schedule.tomorrowFajr, now) : null;

  const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-GB';
  const formatTime = (date: Date) =>
    date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: fonts.md, marginTop: SPACING.md }}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status !== 'ready' || !schedule || !nextPrayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.messageTitle, { fontSize: fonts.lg }]}>
            {status === 'error' ? t('prayer_times_error') : t('location_required')}
          </Text>
          <Text style={[styles.messageText, { fontSize: fonts.sm }]}>{t('location_required_desc')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Ionicons name="refresh" size={18} color={colors.textLight} />
            <Text style={[styles.retryText, { fontSize: fonts.md }]}>{t('try_again')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fonts.xxl }]}>{t('prayer_times')}</Text>
        <Text style={[styles.subtitle, { fontSize: fonts.sm }]}>
          {t('today')} · {formatDate(now)}
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: SPACING.md }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.nextCard}>
          <Text style={[styles.nextLabel, { fontSize: fonts.sm }]}>{t('next_prayer')}</Text>
          <Text style={[styles.nextName, { fontSize: fonts.xxxl }]}>{t(nextPrayer.name)}</Text>
          <Text style={[styles.nextTime, { fontSize: fonts.xl }]}>{formatTime(nextPrayer.time)}</Text>
          <View style={styles.countdown}>
            <Ionicons name="hourglass-outline" size={16} color={colors.onGoldLight} />
            <Text style={[styles.countdownText, { fontSize: fonts.sm }]}>
              {t('time_remaining')}: {formatTimeRemaining(nextPrayer.time.getTime() - now.getTime())}
            </Text>
          </View>
        </View>

        {PRAYER_NAMES.map((name) => {
          const time = schedule.today[name];
          const isNext = nextPrayer.name === name && nextPrayer.time === time;
          const isPast = time.getTime() <= now.getTime();
          return (
            <View key={name} style={[styles.item, isNext && styles.itemNext, isPast && styles.itemPast]}>
              <View style={styles.itemLeft}>
                <Ionicons name={PRAYER_ICONS[name]} size={24} color={isNext ? colors.textLight : colors.primary} />
                <Text style={[styles.name, { fontSize: fonts.lg }, isNext && styles.textOnPrimary]}>{t(name)}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.time, { fontSize: fonts.lg }, isNext && styles.textOnPrimary]}>
                  {formatTime(time)}
                </Text>
                {notifications.supported && isNotifiable(name) && (
                  <TouchableOpacity
                    onPress={() => togglePrayerReminder(name)}
                    style={styles.bell}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: notifications.settings.enabled && notifications.settings.prayers[name] }}
                    accessibilityLabel={`${t('notifications')} · ${t(name)}`}
                  >
                    <Ionicons
                      name={
                        notifications.settings.enabled && notifications.settings.prayers[name]
                          ? 'notifications'
                          : 'notifications-off-outline'
                      }
                      size={22}
                      color={isNext ? colors.textLight : colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {notifications.supported && (
          <View style={styles.notifCard}>
            <View style={styles.notifHeader}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
              <View style={styles.notifTitleBox}>
                <Text style={[styles.notifTitle, { fontSize: fonts.md }]}>{t('notifications')}</Text>
                <Text style={[styles.notifDesc, { fontSize: fonts.xs }]}>{t('notifications_desc')}</Text>
              </View>
              <Switch
                value={notifications.settings.enabled}
                onValueChange={(enabled) => saveNotifications({ ...notifications.settings, enabled })}
                trackColor={{ true: colors.primaryLight, false: colors.border }}
                thumbColor={notifications.settings.enabled ? colors.primary : colors.surfaceAlt}
                accessibilityLabel={t('notifications')}
              />
            </View>
            {notifications.settings.enabled && (
              <>
                <Text style={[styles.notifLabel, { fontSize: fonts.xs }]}>{t('notify_at')}</Text>
                <View style={styles.chips}>
                  {OFFSETS.map((offset) => {
                    const active = notifications.settings.offset === offset;
                    return (
                      <TouchableOpacity
                        key={offset}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => saveNotifications({ ...notifications.settings, offset })}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.chipText, { fontSize: fonts.xs }, active && styles.chipTextActive]}>
                          {offset === 0 ? t('at_prayer_time') : `${offset} ${t('minutes_before')}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {Platform.OS === 'android' && Number(Platform.Version) >= 31 && (
                  <View style={styles.exactRow}>
                    <Text style={[styles.notifDesc, styles.exactText, { fontSize: fonts.xs }]}>{t('exact_alarms')}</Text>
                    <TouchableOpacity style={styles.exactButton} onPress={openExactAlarmSettings}>
                      <Text style={[styles.exactButtonText, { fontSize: fonts.xs }]}>{t('allow')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={[styles.notifDesc, { fontSize: fonts.xs, marginTop: SPACING.sm }]}>
                  {t('notif_refresh_hint')}
                </Text>
              </>
            )}
          </View>
        )}

        <View style={styles.methodCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.methodText, { fontSize: fonts.xs }]}>
            {t('calculation_method')}: {t(schedule.method === 'umm_al_qura' ? 'method_umm_al_qura' : 'method_mwl')}
          </Text>
        </View>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { backgroundColor: c.surface, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: c.border },
  title: { fontWeight: 'bold', color: c.text },
  subtitle: { color: c.textSecondary, marginTop: SPACING.xs },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  messageTitle: { marginTop: SPACING.md, fontWeight: '600', color: c.text, textAlign: 'center' },
  messageText: { marginTop: SPACING.sm, color: c.textSecondary, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.lg },
  retryText: { color: c.textLight, fontWeight: '600', marginLeft: SPACING.xs },
  nextCard: { backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center', ...SHADOWS.medium },
  nextLabel: { color: c.onPrimaryMuted, textTransform: 'uppercase', letterSpacing: 1 },
  nextName: { color: c.textLight, fontWeight: 'bold', marginTop: SPACING.xs },
  nextTime: { color: c.onPrimaryMuted, fontWeight: '600' },
  countdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.goldLight, borderRadius: BORDER_RADIUS.round, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, marginTop: SPACING.md },
  countdownText: { color: c.onGoldLight, fontWeight: '600', marginLeft: SPACING.xs },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.surface, padding: SPACING.lg, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.small },
  itemNext: { backgroundColor: c.primary },
  itemPast: { opacity: 0.6 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '600', color: c.text, marginLeft: SPACING.md },
  time: { fontWeight: '600', color: c.primary },
  textOnPrimary: { color: c.textLight },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  bell: { padding: 4 },
  notifCard: { backgroundColor: c.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md, borderWidth: 1, borderColor: c.border },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  notifTitleBox: { flex: 1 },
  notifTitle: { color: c.text, fontWeight: '700' },
  notifDesc: { color: c.textSecondary },
  notifLabel: { color: c.textSecondary, fontWeight: '600', marginTop: SPACING.md, marginBottom: SPACING.xs, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: { paddingVertical: 6, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceAlt },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.text, fontWeight: '600' },
  chipTextActive: { color: c.textLight },
  exactRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: c.warningBg },
  exactText: { flex: 1, color: c.text },
  exactButton: { paddingVertical: 6, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: c.primary },
  exactButtonText: { color: c.textLight, fontWeight: '700' },
  methodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md },
  methodText: { color: c.textSecondary, marginLeft: SPACING.xs },
});
