import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Path } from 'react-native-svg';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, Palette } from '../constants/theme';
import {
  RITUAL_GUIDE,
  TOTAL_ROUNDS,
  INITIAL_COUNTER,
  CounterState,
  RitualKind,
  incrementRound,
  decrementRound,
  parseCounter,
} from '../data/counter-guide';

const STORAGE_KEY = 'ritual_counter';
const RING = 260;
const STROKE = 16;

/** Arc of the progress ring for segment `i` of `n`, with a small gap between segments. */
function segmentPath(i: number, n: number): string {
  const r = (RING - STROKE) / 2;
  const c = RING / 2;
  const gap = 6;
  const start = (i * 360) / n + gap / 2 - 90;
  const end = ((i + 1) * 360) / n - gap / 2 - 90;
  const pt = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return `${c + r * Math.cos(rad)} ${c + r * Math.sin(rad)}`;
  };
  return `M ${pt(start)} A ${r} ${r} 0 0 1 ${pt(end)}`;
}

const haptic = (kind: 'tap' | 'done') => {
  if (Platform.OS === 'web') return;
  const run =
    kind === 'done'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  run.catch(() => {});
};

export default function CounterScreen() {
  // The phone stays awake while the pilgrim is counting.
  useKeepAwake();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const params = useLocalSearchParams<{ kind?: string }>();
  const [state, setState] = useState<CounterState>(INITIAL_COUNTER);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const saved = parseCounter(raw);
        const kind = params.kind === 'tawaf' || params.kind === 'sai' ? params.kind : saved.kind;
        setState({ ...saved, kind });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    // Only on mount: the route parameter picks the initial ritual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [loaded, state]);

  const guide = RITUAL_GUIDE[state.kind];
  const count = state.rounds[state.kind];
  const done = count >= TOTAL_ROUNDS;

  const count1 = () => {
    if (done) return;
    const next = incrementRound(state);
    haptic(next.rounds[state.kind] >= TOTAL_ROUNDS ? 'done' : 'tap');
    setState(next);
  };

  const undo = () => setState((s) => decrementRound(s));

  const reset = () => {
    const apply = () => setState((s) => ({ ...s, rounds: { ...s.rounds, [s.kind]: 0 } }));
    if (Platform.OS === 'web') {
      apply();
      return;
    }
    Alert.alert(t('reset_counter'), t('reset_counter_confirm'), [
      { text: t('no'), style: 'cancel' },
      { text: t('yes'), style: 'destructive', onPress: apply },
    ]);
  };

  const selectKind = (kind: RitualKind) => setState((s) => ({ ...s, kind }));

  const reminder = count === 0 ? guide.start : done ? guide.done : guide.round(count + 1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel={t('back')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: fonts.xl }]}>{t('counter')}</Text>
        <TouchableOpacity onPress={reset} style={styles.backButton} accessibilityLabel={t('reset_counter')}>
          <Ionicons name="refresh" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segmented} accessibilityRole="tablist">
          {(['tawaf', 'sai'] as RitualKind[]).map((kind) => {
            const active = state.kind === kind;
            return (
              <TouchableOpacity
                key={kind}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => selectKind(kind)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, { fontSize: fonts.md }, active && styles.segmentTextActive]}>
                  {RITUAL_GUIDE[kind].title[language]} · {state.rounds[kind]}/{TOTAL_ROUNDS}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Pressable
          onPress={count1}
          disabled={done}
          style={({ pressed }) => [styles.ringButton, pressed && !done && styles.ringPressed]}
          accessibilityRole="button"
          accessibilityLabel={`${guide.title[language]} ${count}/${TOTAL_ROUNDS}. ${t('tap_to_count')}`}
        >
          <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
            {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
              <Path
                key={i}
                d={segmentPath(i, TOTAL_ROUNDS)}
                stroke={i < count ? (done ? colors.success : colors.primary) : colors.border}
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </Svg>
          {done ? (
            <Ionicons name="checkmark-circle" size={96} color={colors.success} />
          ) : (
            <>
              <Text style={styles.bigCount}>{count}</Text>
              <Text style={[styles.ofTotal, { fontSize: fonts.md }]}>/ {TOTAL_ROUNDS}</Text>
              <Text style={[styles.tapHint, { fontSize: fonts.sm }]}>{t('tap_to_count')}</Text>
            </>
          )}
        </Pressable>

        <TouchableOpacity style={styles.undo} onPress={undo} disabled={count === 0}>
          <Ionicons name="arrow-undo" size={18} color={count === 0 ? colors.divider : colors.primary} />
          <Text style={[styles.undoText, { fontSize: fonts.sm }, count === 0 && { color: colors.divider }]}>
            {t('undo')}
          </Text>
        </TouchableOpacity>

        <View style={[styles.card, done && styles.cardDone]}>
          {!done && count > 0 && (
            <Text style={[styles.cardLabel, { fontSize: fonts.xs }]}>
              {t('round')} {count + 1}
            </Text>
          )}
          <Text style={[styles.cardText, { fontSize: fonts.md }]}>{reminder[language]}</Text>
        </View>

        {guide.dua && !done && (
          <View style={styles.card}>
            <Text style={[styles.arabic, { fontSize: fonts.xl }]}>{guide.dua.arabic}</Text>
            <Text style={[styles.cardSub, { fontSize: fonts.sm }]}>{guide.dua.meaning[language]}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontWeight: 'bold', color: c.text },
    content: { padding: SPACING.md, alignItems: 'stretch', paddingBottom: SPACING.xxl },
    segmented: {
      flexDirection: 'row',
      backgroundColor: c.surfaceAlt,
      borderRadius: BORDER_RADIUS.round,
      padding: 4,
      marginBottom: SPACING.lg,
    },
    segment: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round, alignItems: 'center' },
    segmentActive: { backgroundColor: c.primary },
    segmentText: { color: c.text, fontWeight: '600' },
    segmentTextActive: { color: c.textLight },
    ringButton: {
      width: RING,
      height: RING,
      borderRadius: RING / 2,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      ...SHADOWS.medium,
    },
    ringPressed: { transform: [{ scale: 0.97 }], backgroundColor: c.surfaceAlt },
    bigCount: { fontSize: 88, fontWeight: 'bold', color: c.text, lineHeight: 96 },
    ofTotal: { color: c.textSecondary, fontWeight: '600' },
    tapHint: { color: c.textSecondary, marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.xl },
    undo: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: SPACING.xs,
      padding: SPACING.md,
      marginTop: SPACING.sm,
    },
    undoText: { color: c.primary, fontWeight: '600' },
    card: {
      backgroundColor: c.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardDone: { backgroundColor: c.successBg, borderColor: c.success },
    cardLabel: { color: c.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: SPACING.xs },
    cardText: { color: c.text, lineHeight: 24 },
    cardSub: { color: c.textSecondary, marginTop: SPACING.sm, lineHeight: 20 },
    arabic: { color: c.text, textAlign: 'center', writingDirection: 'rtl', lineHeight: 38 },
  });
