import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { usePrayerNotifications } from '../../contexts/NotificationsContext';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, Palette } from '../../constants/theme';
import { AdBanner } from '../../components/AdBanner';
import { AppMessages } from '../../components/AppMessages';
import { IslamicPattern } from '../../components/IslamicPattern';
import umrahSteps from '../../data/umrah-steps.json';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';
import { computePrayerTimes, getNextPrayer } from '../../utils/prayer';
import { formatTimeRemaining } from '../../utils/calculations';

const STEPS = [...umrahSteps].sort((a, b) => a.order - b.order);
const STEP_IDS = new Set(STEPS.map((step) => step.id));

type Tile = { key: string; icon: keyof typeof Ionicons.glyphMap; label: string; href: Href; gold?: boolean };

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language, isRTL } = useLanguage();
  const { fontSize, completedSteps } = useSettings();
  const { coords } = usePrayerNotifications();
  const fonts = FONT_SIZES[fontSize];
  const align = { textAlign: isRTL ? ('right' as const) : ('left' as const) };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Next prayer from the last known position: no location prompt on the home screen.
  const dayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const nextPrayer = useMemo(() => {
    if (!coords) return null;
    const day = new Date(dayKey);
    const tomorrow = new Date(dayKey);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = computePrayerTimes(coords.latitude, coords.longitude, day).times;
    const next = computePrayerTimes(coords.latitude, coords.longitude, tomorrow).times;
    return { today, tomorrowFajr: next.fajr };
  }, [coords, dayKey]);
  const upcoming = nextPrayer ? getNextPrayer(nextPrayer.today, nextPrayer.tomorrowFajr, now) : null;

  // Ignore ids of steps that may have been removed from the guide since they were saved.
  const doneCount = completedSteps.filter((id) => STEP_IDS.has(id)).length;
  const percent = Math.min(100, (doneCount / STEPS.length) * 100);
  const nextStep = STEPS.find((s) => !completedSteps.includes(s.id));

  const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-GB';
  const formatTime = (date: Date) =>
    date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

  const tiles: Tile[] = [
    { key: 'guide', icon: 'book', label: t('tab_guide'), href: '/guide' },
    { key: 'counter', icon: 'repeat', label: t('counter_short'), href: '/counter', gold: true },
    { key: 'prayers', icon: 'time', label: t('tab_prayers'), href: '/prayer-times' },
    { key: 'qibla', icon: 'compass', label: t('qibla'), href: '/qibla', gold: true },
    { key: 'miqat', icon: 'location', label: t('miqat'), href: '/miqat' },
    { key: 'duas', icon: 'heart', label: t('duas'), href: '/duas', gold: true },
    { key: 'places', icon: 'map', label: t('places'), href: '/places' },
    { key: 'checklist', icon: 'checkbox', label: t('checklist_short'), href: '/checklist', gold: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.pattern, isRTL ? { left: -30 } : { right: -30 }]}>
            <IslamicPattern width={170} height={170} opacity={0.18} />
          </View>
          <Text style={[styles.greeting, { fontSize: fonts.sm }, align]}>{t('peace_greeting')}</Text>
          <Text style={[styles.title, { fontSize: fonts.xxl }, align]}>{t('welcome_title')}</Text>

          <TouchableOpacity
            style={styles.prayerPill}
            onPress={() => router.push('/prayer-times')}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Ionicons name="time-outline" size={20} color={colors.onGold} />
            {upcoming ? (
              <Text style={[styles.prayerPillText, { fontSize: fonts.md }]}>
                {t(upcoming.name)} · {formatTime(upcoming.time)} ·{' '}
                {formatTimeRemaining(upcoming.time.getTime() - now.getTime())}
              </Text>
            ) : (
              <Text style={[styles.prayerPillText, { fontSize: fonts.md }]}>{t('see_prayer_times')}</Text>
            )}
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.onGold} />
          </TouchableOpacity>
        </View>

        <AppMessages />

        {/* Guide progress */}
        <TouchableOpacity style={styles.guideCard} onPress={() => router.push('/guide')} activeOpacity={0.85}>
          <View style={styles.guideHeader}>
            <View style={styles.guideIcon}>
              <Ionicons name={nextStep ? 'walk' : 'checkmark-done'} size={24} color={colors.textLight} />
            </View>
            <View style={styles.guideBody}>
              <Text style={[styles.guideLabel, { fontSize: fonts.xs }, align]}>
                {doneCount === 0 ? t('start_here') : nextStep ? t('next_step') : t('progress')}
              </Text>
              <Text style={[styles.guideTitle, { fontSize: fonts.lg }, align]}>
                {nextStep ? nextStep.title[language as 'ar' | 'en' | 'fr'] : t('all_steps_done')}
              </Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={22} color={colors.textSecondary} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={[styles.progressText, { fontSize: fonts.xs }, align]}>
            {doneCount} / {STEPS.length} {t('step_completed')}
          </Text>
        </TouchableOpacity>

        {/* All features */}
        <Text style={[styles.sectionTitle, { fontSize: fonts.lg }, align]}>{t('explore')}</Text>
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <TouchableOpacity
              key={tile.key}
              style={styles.tile}
              onPress={() => router.push(tile.href)}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <View style={[styles.tileIcon, { backgroundColor: tile.gold ? colors.gold : colors.primary }]}>
                <Ionicons name={tile.icon} size={24} color={tile.gold ? colors.onGold : colors.textLight} />
              </View>
              <Text style={[styles.tileLabel, { fontSize: fonts.sm }]} numberOfLines={2}>
                {tile.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.disclaimerText, { fontSize: fonts.xs }, align]}>{t('disclaimer_desc')}</Text>
        </View>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { paddingBottom: SPACING.xl },
    hero: {
      backgroundColor: c.primary,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.xl,
      borderBottomLeftRadius: BORDER_RADIUS.xl,
      borderBottomRightRadius: BORDER_RADIUS.xl,
      overflow: 'hidden',
    },
    pattern: { position: 'absolute', top: -20 },
    greeting: { color: c.onPrimaryMuted, fontWeight: '600', letterSpacing: 0.5 },
    title: { color: c.textLight, fontWeight: 'bold', marginTop: SPACING.xs },
    prayerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: SPACING.sm,
      backgroundColor: c.gold,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      marginTop: SPACING.lg,
    },
    prayerPillText: { color: c.onGold, fontWeight: '700' },
    guideCard: {
      backgroundColor: c.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: c.border,
      ...SHADOWS.small,
    },
    guideHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    guideIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guideBody: { flex: 1 },
    guideLabel: { color: c.primary, fontWeight: '700', textTransform: 'uppercase' },
    guideTitle: { color: c.text, fontWeight: 'bold' },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: c.surfaceAlt, overflow: 'hidden', marginTop: SPACING.md },
    progressFill: { height: '100%', backgroundColor: c.primary, borderRadius: 4 },
    progressText: { color: c.textSecondary, marginTop: SPACING.xs },
    sectionTitle: { color: c.text, fontWeight: 'bold', marginTop: SPACING.lg, marginHorizontal: SPACING.md },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: SPACING.md - SPACING.xs,
      marginTop: SPACING.sm,
    },
    tile: {
      width: '25%',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs,
    },
    tileIcon: {
      width: 56,
      height: 56,
      borderRadius: BORDER_RADIUS.lg,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.small,
    },
    tileLabel: { color: c.text, fontWeight: '600', textAlign: 'center', marginTop: SPACING.xs },
    disclaimer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      margin: SPACING.md,
      marginTop: SPACING.lg,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: c.surfaceAlt,
    },
    disclaimerText: { flex: 1, color: c.textSecondary, lineHeight: 18 },
  });
