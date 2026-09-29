import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../../constants/theme';
import { AdBanner } from '../../components/AdBanner';
import { formatTimeRemaining } from '../../utils/calculations';
import { getCurrentCoords, Coords } from '../../utils/location';
import { computePrayerTimes, getNextPrayer, PRAYER_NAMES, PrayerName } from '../../utils/prayer';

type Status = 'loading' | 'ready' | 'denied' | 'error';

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
  const { t, language } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [status, setStatus] = useState<Status>('loading');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadLocation = useCallback(async () => {
    try {
      const result = await getCurrentCoords();
      if (!result) {
        setStatus('denied');
        return;
      }
      setCoords(result);
      setStatus('ready');
    } catch (error) {
      console.error('Error getting location for prayer times:', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadLocation();
    // Refresh every 30s so the countdown and the highlighted prayer stay accurate.
    const timer = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, [loadLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocation();
    setNow(new Date());
    setRefreshing(false);
  };

  const retry = () => {
    setStatus('loading');
    loadLocation();
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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ fontSize: fonts.md, marginTop: SPACING.md }}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status !== 'ready' || !schedule || !nextPrayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="location-outline" size={64} color={COLORS.textSecondary} />
          <Text style={[styles.messageTitle, { fontSize: fonts.lg }]}>
            {status === 'error' ? t('prayer_times_error') : t('location_required')}
          </Text>
          <Text style={[styles.messageText, { fontSize: fonts.sm }]}>{t('location_required_desc')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Ionicons name="refresh" size={18} color={COLORS.textLight} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.nextCard}>
          <Text style={[styles.nextLabel, { fontSize: fonts.sm }]}>{t('next_prayer')}</Text>
          <Text style={[styles.nextName, { fontSize: fonts.xxxl }]}>{t(nextPrayer.name)}</Text>
          <Text style={[styles.nextTime, { fontSize: fonts.xl }]}>{formatTime(nextPrayer.time)}</Text>
          <View style={styles.countdown}>
            <Ionicons name="hourglass-outline" size={16} color={COLORS.primaryDark} />
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
                <Ionicons name={PRAYER_ICONS[name]} size={24} color={isNext ? COLORS.textLight : COLORS.primary} />
                <Text style={[styles.name, { fontSize: fonts.lg }, isNext && styles.textOnPrimary]}>{t(name)}</Text>
              </View>
              <Text style={[styles.time, { fontSize: fonts.lg }, isNext && styles.textOnPrimary]}>
                {formatTime(time)}
              </Text>
            </View>
          );
        })}

        <View style={styles.methodCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
          <Text style={[styles.methodText, { fontSize: fonts.xs }]}>
            {t('calculation_method')}: {t(schedule.method === 'umm_al_qura' ? 'method_umm_al_qura' : 'method_mwl')}
          </Text>
        </View>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontWeight: 'bold', color: COLORS.text },
  subtitle: { color: COLORS.textSecondary, marginTop: SPACING.xs },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  messageTitle: { marginTop: SPACING.md, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  messageText: { marginTop: SPACING.sm, color: COLORS.textSecondary, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.lg },
  retryText: { color: COLORS.textLight, fontWeight: '600', marginLeft: SPACING.xs },
  nextCard: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center', ...SHADOWS.medium },
  nextLabel: { color: COLORS.goldLight, textTransform: 'uppercase', letterSpacing: 1 },
  nextName: { color: COLORS.textLight, fontWeight: 'bold', marginTop: SPACING.xs },
  nextTime: { color: COLORS.gold, fontWeight: '600' },
  countdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.goldLight, borderRadius: BORDER_RADIUS.round, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, marginTop: SPACING.md },
  countdownText: { color: COLORS.primaryDark, fontWeight: '600', marginLeft: SPACING.xs },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.lg, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.small },
  itemNext: { backgroundColor: COLORS.primaryLight },
  itemPast: { opacity: 0.6 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '600', color: COLORS.text, marginLeft: SPACING.md },
  time: { fontWeight: '600', color: COLORS.primary },
  textOnPrimary: { color: COLORS.textLight },
  methodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md },
  methodText: { color: COLORS.textSecondary, marginLeft: SPACING.xs },
});
