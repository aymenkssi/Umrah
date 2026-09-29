import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants/theme';
import { calculateQiblaDirection, normalizeAngle } from '../../utils/calculations';
import { useCoords } from '../../hooks/useCoords';
import { useHeading } from '../../hooks/useHeading';

const ALIGNMENT_TOLERANCE = 5; // degrees
const DIAL_SIZE = 260;

export default function QiblaScreen() {
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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ fontSize: fonts.md, marginTop: SPACING.md }}>{t('calibrating')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status !== 'ready' || qiblaDirection === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="compass-outline" size={64} color={COLORS.textSecondary} />
          <Text style={[styles.messageTitle, { fontSize: fonts.lg }]}>
            {status === 'error' ? t('qibla_error') : t('location_required')}
          </Text>
          <Text style={[styles.messageText, { fontSize: fonts.sm }]}>{t('location_required_qibla')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Ionicons name="refresh" size={18} color={COLORS.textLight} />
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
            color={isAligned ? COLORS.success : COLORS.primary}
          />
          <Text style={{ fontSize: fonts.lg, marginLeft: SPACING.sm, color: COLORS.text }}>
            {isAligned ? t('qibla_found') : t('hold_flat')}
          </Text>
        </View>

        {lowAccuracy && (
          <View style={styles.warning}>
            <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
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
                <Ionicons name="cube" size={22} color={COLORS.textLight} />
              </View>
              <View style={styles.needleHead} />
            </View>
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoCard}>
            <Ionicons name="compass" size={24} color={COLORS.primary} />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Text style={{ fontSize: fonts.sm, color: COLORS.textSecondary }}>{t('direction_to_kaaba')}</Text>
              <Text style={{ fontSize: fonts.xl, fontWeight: 'bold', color: COLORS.text }}>
                {Math.round(qiblaDirection)}°
              </Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={24} color={COLORS.goldDark} />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Text style={{ fontSize: fonts.sm, color: COLORS.textSecondary }}>{t('distance_to_makkah')}</Text>
              <Text style={{ fontSize: fonts.xl, fontWeight: 'bold', color: COLORS.text }}>
                {distance?.toFixed(0)} {t('km')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontWeight: 'bold', color: COLORS.text },
  content: { flex: 1, padding: SPACING.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  messageTitle: { marginTop: SPACING.md, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  messageText: { marginTop: SPACING.sm, color: COLORS.textSecondary, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.lg },
  retryText: { color: COLORS.textLight, fontWeight: '600', marginLeft: SPACING.xs },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 2, borderColor: COLORS.border },
  statusAligned: { backgroundColor: '#E8F5E9', borderColor: COLORS.success },
  warning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginTop: SPACING.sm },
  warningText: { flex: 1, color: COLORS.text, marginLeft: SPACING.xs },
  compassContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.xl },
  compass: { width: DIAL_SIZE, height: DIAL_SIZE, borderRadius: DIAL_SIZE / 2, backgroundColor: COLORS.surface, borderWidth: 4, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  compassAligned: { borderColor: COLORS.success, backgroundColor: '#F1F8E9' },
  dial: { position: 'absolute', width: DIAL_SIZE - 8, height: DIAL_SIZE - 8 },
  cardinal: { position: 'absolute', fontWeight: 'bold', fontSize: 16, color: COLORS.textSecondary },
  north: { top: 6, alignSelf: 'center', color: COLORS.error },
  south: { bottom: 6, alignSelf: 'center' },
  east: { right: 10, top: (DIAL_SIZE - 8) / 2 - 11 },
  west: { left: 10, top: (DIAL_SIZE - 8) / 2 - 11 },
  needle: { position: 'absolute', width: DIAL_SIZE, height: DIAL_SIZE, alignItems: 'center' },
  kaabaMarker: { marginTop: 28, width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.text, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.gold },
  needleHead: { width: 4, height: DIAL_SIZE / 2 - 68, backgroundColor: COLORS.gold },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, position: 'absolute' },
  info: { flexDirection: 'row', gap: SPACING.md },
  infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
});
