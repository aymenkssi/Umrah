import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants/theme';
import { calculateQiblaDirection } from '../../utils/calculations';

export default function QiblaScreen() {
  const { t } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [loading, setLoading] = useState(true);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    setupQibla();
    return () => { Magnetometer.removeAllListeners(); };
  }, []);

  const setupQibla = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_denied'), t('location_required_desc'));
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { bearing, distance: dist } = calculateQiblaDirection(location.coords.latitude, location.coords.longitude);
      setQiblaDirection(bearing);
      setDistance(dist);
      Magnetometer.setUpdateInterval(100);
      Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        setHeading((angle + 360) % 360);
      });
      setLoading(false);
    } catch (error) {
      Alert.alert(t('error'), 'Could not determine Qibla direction');
      setLoading(false);
    }
  };

  const compassRotation = qiblaDirection !== null ? qiblaDirection - heading : 0;
  const normalizeAngle = (angle: number) => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  };
  const normalizedRotation = normalizeAngle(compassRotation);
  const isAligned = Math.abs(normalizedRotation) < 5;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ fontSize: fonts.md, marginTop: SPACING.md }}>{t('calibrating')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (qiblaDirection === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="compass-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ fontSize: fonts.lg, marginTop: SPACING.md }}>{t('location_required')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fonts.xxl }]}>{t('qibla')}</Text>
      </View>
      <View style={styles.content}>
        <View style={[styles.status, isAligned && { backgroundColor: '#E8F5E9', borderColor: COLORS.success }]}>
          <Ionicons name={isAligned ? 'checkmark-circle' : 'navigate-circle'} size={28} color={isAligned ? COLORS.success : COLORS.primary} />
          <Text style={{ fontSize: fonts.lg, marginLeft: SPACING.sm }}>{isAligned ? t('qibla_found') : t('hold_flat')}</Text>
        </View>

        <View style={styles.compassContainer}>
          <View style={styles.compass}>
            <Animated.View style={[styles.needle, { transform: [{ rotate: `${normalizedRotation}deg` }] }]}>
              <View style={styles.needleN} />
              <View style={styles.needleS} />
            </Animated.View>
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoCard}>
            <Ionicons name="compass" size={24} color={COLORS.primary} />
            <View style={{ marginLeft: SPACING.sm }}>
              <Text style={{ fontSize: fonts.sm, color: COLORS.textSecondary }}>{t('direction_to_kaaba')}</Text>
              <Text style={{ fontSize: fonts.xl, fontWeight: 'bold' }}>{Math.round(qiblaDirection)}°</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={24} color={COLORS.goldDark} />
            <View style={{ marginLeft: SPACING.sm }}>
              <Text style={{ fontSize: fonts.sm, color: COLORS.textSecondary }}>{t('distance_to_makkah')}</Text>
              <Text style={{ fontSize: fonts.xl, fontWeight: 'bold' }}>{distance?.toFixed(0)} {t('km')}</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 2, borderColor: COLORS.border },
  compassContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.xxl },
  compass: { width: 250, height: 250, borderRadius: 125, backgroundColor: COLORS.surface, borderWidth: 4, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  needle: { position: 'absolute', width: 8, height: 100, alignItems: 'center' },
  needleN: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 50, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.error },
  needleS: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 50, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.textSecondary },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, position: 'absolute' },
  info: { flexDirection: 'row', gap: SPACING.md },
  infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
});
