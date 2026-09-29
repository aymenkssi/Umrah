import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES, Palette } from '../../constants/theme';
import { calculateQiblaDirection, normalizeAngle } from '../../utils/calculations';
import { useCoords } from '../../hooks/useCoords';
import { useHeading } from '../../hooks/useHeading';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';

const ALIGNMENT_TOLERANCE = 5; // degrees
const DIAL_SIZE = 260;

export default function QiblaScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const { status: locationStatus, coords, retry } = useCoords();
  const compass = useHeading(locationStatus === 'ready');
  const qibla = useMemo(
    () => (coords ? calculateQiblaDirection(coords.latitude, coords.longitude) : null),
    [coords]
  );
  const qiblaDirection = qibla?.bearing ?? null;
  const distance = qibla?.distance ?? null;
  const heading = compass.heading ?? 0;
  const lowAccuracy = compass.accuracy > 0 && compass.accuracy < 2;
  const status: 'loading' | 'ready' | 'denied' | 'error' = compass.error ? 'error' : locationStatus;

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: fonts.md, marginTop: SPACING.md }}>{t('calibrating')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status !== 'ready' || qiblaDirection === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="compass-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.messageTitle, { fontSize: fonts.lg }]}>
            {status === 'error' ? t('qibla_error') : t('location_required')}
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

  const qiblaRotation = normalizeAngle(qiblaDirection - heading);
  const isAligned = Math.abs(qiblaRotation) < ALIGNMENT_TOLERANCE;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fonts.xxl }]}>{t('qibla')}</Text>
      </View>
      <View style={styles.content}>
        <View style={[styles.status, isAligned && styles.statusAligned]}>
          <Ionicons
            name={isAligned ? 'checkmark-circle' : 'navigate-circle'}
            size={28}
            color={isAligned ? colors.success : colors.primary}
          />
          <Text style={{ fontSize: fonts.lg, marginLeft: SPACING.sm, color: colors.text }}>
            {isAligned ? t('qibla_found') : t('hold_flat')}
          </Text>
        </View>

        {lowAccuracy && (
          <View style={styles.warning}>
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <Text style={[styles.warningText, { fontSize: fonts.xs }]}>{t('compass_accuracy_low')}</Text>
          </View>
        )}

        <View style={styles.compassContainer}>
          <View style={[styles.compass, isAligned && styles.compassAligned]}>
            {/* Dial rotates so that "N" always points to true north */}
            <View style={[styles.dial, { transform: [{ rotate: `${-heading}deg` }] }]}>
              <Text style={[styles.cardinal, styles.north]}>N</Text>
              <Text style={[styles.cardinal, styles.east]}>E</Text>
              <Text style={[styles.cardinal, styles.south]}>S</Text>
              <Text style={[styles.cardinal, styles.west]}>W</Text>
            </View>
            {/* Arrow points to the Kaaba */}
            <View style={[styles.needle, { transform: [{ rotate: `${qiblaRotation}deg` }] }]}>
              <View style={styles.kaabaMarker}>
                <Ionicons name="cube" size={22} color={colors.textLight} />
              </View>
              <View style={styles.needleHead} />
            </View>
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoCard}>
            <Ionicons name="compass" size={24} color={colors.primary} />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Text style={{ fontSize: fonts.sm, color: colors.textSecondary }}>{t('direction_to_kaaba')}</Text>
              <Text style={{ fontSize: fonts.xl, fontWeight: 'bold', color: colors.text }}>
                {Math.round(qiblaDirection)}°
              </Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={24} color={colors.goldDark} />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Text style={{ fontSize: fonts.sm, color: colors.textSecondary }}>{t('distance_to_makkah')}</Text>
              <Text style={{ fontSize: fonts.xl, fontWeight: 'bold', color: colors.text }}>
                {distance?.toFixed(0)} {t('km')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { backgroundColor: c.surface, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: c.border },
  title: { fontWeight: 'bold', color: c.text },
  content: { flex: 1, padding: SPACING.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  messageTitle: { marginTop: SPACING.md, fontWeight: '600', color: c.text, textAlign: 'center' },
  messageText: { marginTop: SPACING.sm, color: c.textSecondary, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.lg },
  retryText: { color: c.textLight, fontWeight: '600', marginLeft: SPACING.xs },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 2, borderColor: c.border },
  statusAligned: { backgroundColor: c.successBg, borderColor: c.success },
  warning: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.warningBg, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginTop: SPACING.sm },
  warningText: { flex: 1, color: c.text, marginLeft: SPACING.xs },
  compassContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.xl },
  compass: { width: DIAL_SIZE, height: DIAL_SIZE, borderRadius: DIAL_SIZE / 2, backgroundColor: c.surface, borderWidth: 4, borderColor: c.primary, justifyContent: 'center', alignItems: 'center' },
  compassAligned: { borderColor: c.success, backgroundColor: c.successBg },
  dial: { position: 'absolute', width: DIAL_SIZE - 8, height: DIAL_SIZE - 8 },
  cardinal: { position: 'absolute', fontWeight: 'bold', fontSize: 16, color: c.textSecondary },
  north: { top: 6, alignSelf: 'center', color: c.error },
  south: { bottom: 6, alignSelf: 'center' },
  east: { right: 10, top: (DIAL_SIZE - 8) / 2 - 11 },
  west: { left: 10, top: (DIAL_SIZE - 8) / 2 - 11 },
  needle: { position: 'absolute', width: DIAL_SIZE, height: DIAL_SIZE, alignItems: 'center' },
  kaabaMarker: { marginTop: 28, width: 40, height: 40, borderRadius: 20, backgroundColor: c.text, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: c.gold },
  needleHead: { width: 4, height: DIAL_SIZE / 2 - 68, backgroundColor: c.gold },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: c.primary, position: 'absolute' },
  info: { flexDirection: 'row', gap: SPACING.md },
  infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
});
