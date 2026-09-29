import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES, Palette } from '../../constants/theme';
import { calculateQiblaDirection, qiblaGuidance } from '../../utils/calculations';
import { useCoords } from '../../hooks/useCoords';
import { useHeading } from '../../hooks/useHeading';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';

const ALIGNMENT_TOLERANCE = 5; // degrees
const DIAL = 280;
const R = DIAL / 2;
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const CARDINALS = [
  { angle: 0, label: 'N' },
  { angle: 90, label: 'E' },
  { angle: 180, label: 'S' },
  { angle: 270, label: 'W' },
];

/** Point on the dial for an angle measured clockwise from the top. */
const polar = (angle: number, radius: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: R + radius * Math.cos(rad), y: R + radius * Math.sin(rad) };
};

export default function QiblaScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const focused = useIsFocused();
  const { status: locationStatus, coords, retry } = useCoords();
  // The compass only runs while this tab is visible, to save battery.
  const compass = useHeading(focused && locationStatus === 'ready' && Platform.OS !== 'web');

  const qibla = useMemo(
    () => (coords ? calculateQiblaDirection(coords.latitude, coords.longitude) : null),
    [coords]
  );
  const hasCompass = compass.heading !== null && !compass.error;
  const heading = compass.heading ?? 0;
  const guidance = qibla && hasCompass ? qiblaGuidance(qibla.bearing, heading, ALIGNMENT_TOLERANCE) : null;
  const aligned = guidance?.aligned ?? false;
  const lowAccuracy = hasCompass && compass.accuracy > 0 && compass.accuracy < 2;

  // One short vibration each time the phone becomes aligned with the Qibla.
  const wasAligned = useRef(false);
  useEffect(() => {
    if (aligned && !wasAligned.current && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    wasAligned.current = aligned;
  }, [aligned]);

  if (locationStatus === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.messageText, { fontSize: fonts.md }]}>{t('calibrating')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!qibla) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="compass-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.messageTitle, { fontSize: fonts.lg }]}>
            {locationStatus === 'error' ? t('qibla_error') : t('location_required')}
          </Text>
          <Text style={[styles.messageText, { fontSize: fonts.sm }]}>{t('location_required_qibla')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Ionicons name="refresh" size={18} color={colors.textLight} />
            <Text style={[styles.retryText, { fontSize: fonts.md }]}>{t('try_again')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ring = aligned ? colors.success : colors.primary;
  const kaaba = polar(qibla.bearing, R - 60);
  const statusIcon = aligned
    ? 'checkmark-circle'
    : guidance?.direction === 'left'
      ? 'arrow-undo'
      : guidance
        ? 'arrow-redo'
        : 'compass';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fonts.xxl }]}>{t('qibla')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.status, aligned && styles.statusAligned]} accessibilityLiveRegion="polite">
          <Ionicons name={statusIcon} size={26} color={aligned ? colors.success : colors.primary} />
          <Text style={[styles.statusText, { fontSize: fonts.lg }]}>
            {!hasCompass
              ? t('hold_flat')
              : aligned
                ? t('qibla_facing')
                : `${t(guidance?.direction === 'left' ? 'turn_left' : 'turn_right')} ${guidance?.degrees}°`}
          </Text>
        </View>

        {/* The dial turns with the phone; the fixed marker at the top is where the phone points. */}
        <View style={styles.compassWrap}>
          <View style={[styles.topMarker, { borderBottomColor: ring }]} accessibilityLabel={t('top_of_phone')} />
          <View style={{ width: DIAL, height: DIAL, transform: [{ rotate: `${-heading}deg` }] }}>
            <Svg width={DIAL} height={DIAL}>
              <Circle cx={R} cy={R} r={R - 2} fill={colors.surface} stroke={ring} strokeWidth={4} />
              {TICKS.map((a) => {
                const major = a % 30 === 0;
                const p1 = polar(a, R - 8);
                const p2 = polar(a, R - (major ? 22 : 14));
                return (
                  <Line
                    key={a}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={major ? colors.text : colors.divider}
                    strokeWidth={major ? 2 : 1}
                  />
                );
              })}
              {CARDINALS.map(({ angle, label }) => {
                const p = polar(angle, R - 38);
                return (
                  <SvgText
                    key={label}
                    x={p.x}
                    y={p.y + 6}
                    fontSize={18}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill={label === 'N' ? colors.error : colors.textSecondary}
                    rotation={heading}
                    origin={`${p.x}, ${p.y}`}
                  >
                    {label}
                  </SvgText>
                );
              })}
              <Line
                x1={R}
                y1={R}
                x2={kaaba.x}
                y2={kaaba.y}
                stroke={colors.gold}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <Circle cx={kaaba.x} cy={kaaba.y} r={20} fill={colors.onGold} stroke={colors.gold} strokeWidth={3} />
              <Circle cx={R} cy={R} r={7} fill={ring} />
            </Svg>
            {/* Kaaba icon over the marker, kept upright while the dial turns */}
            <View
              style={[
                styles.kaabaIcon,
                { left: kaaba.x - 12, top: kaaba.y - 12, transform: [{ rotate: `${heading}deg` }] },
              ]}
            >
              <Ionicons name="cube" size={24} color={colors.gold} />
            </View>
          </View>
        </View>

        {!hasCompass && (
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={[styles.noticeText, { fontSize: fonts.sm }]}>{t('compass_unavailable')}</Text>
          </View>
        )}

        {lowAccuracy && (
          <View style={[styles.notice, styles.warning]}>
            <Ionicons name="infinite-outline" size={22} color={colors.warning} />
            <View style={styles.noticeBody}>
              <Text style={[styles.noticeTitle, { fontSize: fonts.sm }]}>{t('calibrate')}</Text>
              <Text style={[styles.noticeText, { fontSize: fonts.xs }]}>{t('compass_accuracy_low')}</Text>
            </View>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.infoCard}>
            <Ionicons name="navigate" size={22} color={colors.primary} />
            <View style={styles.infoBody}>
              <Text style={[styles.infoLabel, { fontSize: fonts.xs }]}>{t('qibla_bearing')}</Text>
              <Text style={[styles.infoValue, { fontSize: fonts.xl }]}>{Math.round(qibla.bearing)}°</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={22} color={colors.goldDark} />
            <View style={styles.infoBody}>
              <Text style={[styles.infoLabel, { fontSize: fonts.xs }]}>{t('distance_to_makkah')}</Text>
              <Text style={[styles.infoValue, { fontSize: fonts.xl }]}>
                {Math.round(qibla.distance).toLocaleString()} {t('km')}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.tips, { fontSize: fonts.xs }]}>{t('qibla_tips')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { backgroundColor: c.surface, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: c.border },
    title: { fontWeight: 'bold', color: c.text },
    content: { padding: SPACING.md, paddingBottom: SPACING.xl },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
    messageTitle: { marginTop: SPACING.md, fontWeight: '600', color: c.text, textAlign: 'center' },
    messageText: { marginTop: SPACING.sm, color: c.textSecondary, textAlign: 'center' },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
      marginTop: SPACING.lg,
    },
    retryText: { color: c.textLight, fontWeight: '600', marginLeft: SPACING.xs },
    status: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      backgroundColor: c.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      borderWidth: 2,
      borderColor: c.border,
    },
    statusAligned: { backgroundColor: c.successBg, borderColor: c.success },
    statusText: { color: c.text, fontWeight: '600' },
    compassWrap: { alignItems: 'center', marginVertical: SPACING.lg },
    topMarker: {
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderBottomWidth: 18,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      marginBottom: 6,
    },
    kaabaIcon: { position: 'absolute', width: 24, height: 24 },
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: c.surface,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    warning: { backgroundColor: c.warningBg, borderColor: c.warning },
    noticeBody: { flex: 1 },
    noticeTitle: { color: c.text, fontWeight: '700' },
    noticeText: { flex: 1, color: c.text },
    info: { flexDirection: 'row', gap: SPACING.md },
    infoCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
    },
    infoBody: { marginLeft: SPACING.sm, flex: 1 },
    infoLabel: { color: c.textSecondary },
    infoValue: { fontWeight: 'bold', color: c.text },
    tips: { color: c.textSecondary, textAlign: 'center', marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
  });
