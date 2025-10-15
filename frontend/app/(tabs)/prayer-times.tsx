import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../../constants/theme';

const PRAYER_NAMES = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function PrayerTimesScreen() {
  const { t } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    requestLocationAndCalculate();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const requestLocationAndCalculate = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_denied'), t('location_required_desc'));
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coordinates = new Coordinates(loc.coords.latitude, loc.coords.longitude);
      const times = new PrayerTimes(coordinates, new Date(), CalculationMethod.MuslimWorldLeague());
      setPrayerTimes(times);
    } catch (error) {
      Alert.alert(t('error'), 'Could not calculate prayer times');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ fontSize: fonts.md, marginTop: SPACING.md }}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prayerTimes) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="location-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ fontSize: fonts.lg, marginTop: SPACING.md }}>{t('location_required')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fonts.xxl }]}>{t('prayer_times')}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: SPACING.md }}>
        {PRAYER_NAMES.map((name) => {
          const time = prayerTimes[name];
          return (
            <View key={name} style={styles.item}>
              <View style={styles.itemLeft}>
                <Ionicons name="time" size={24} color={COLORS.primary} />
                <Text style={[styles.name, { fontSize: fonts.lg }]}>{t(name)}</Text>
              </View>
              <Text style={[styles.time, { fontSize: fonts.lg }]}>{time && formatTime(time)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontWeight: 'bold', color: COLORS.text },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.lg, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.small },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '600', color: COLORS.text, marginLeft: SPACING.md },
  time: { fontWeight: '600', color: COLORS.primary },
});
