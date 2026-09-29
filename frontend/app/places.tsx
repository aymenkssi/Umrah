import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { SPACING, BORDER_RADIUS, FONT_SIZES, Palette } from '../constants/theme';
import { useCoords } from '../hooks/useCoords';
import { calculateDistance } from '../utils/calculations';
import { City, EMERGENCY_NUMBERS, PLACES, Place, directionsUrl, nearestCity } from '../data/places';

const open = (url: string) => Linking.openURL(url).catch((error) => console.error('Cannot open link:', error));

const formatDistance = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

export default function PlacesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language, isRTL } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const { coords } = useCoords();
  const [chosenCity, setChosenCity] = useState<City | null>(null);
  // Until the user picks a city, show the one they are closest to.
  const city = chosenCity ?? (coords ? nearestCity(coords.latitude, coords.longitude) : 'makkah');

  const places = useMemo(() => {
    const list = PLACES.filter((p) => p.city === city).map((p) => ({
      place: p,
      distance:
        coords && p.lat !== undefined && p.lng !== undefined
          ? calculateDistance(coords.latitude, coords.longitude, p.lat, p.lng)
          : null,
    }));
    // Landmarks by distance when known; services (no coordinates) stay last.
    return list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [city, coords]);

  const iconColor = (kind: Place['kind']) =>
    kind === 'health' ? colors.error : kind === 'ritual' ? colors.goldDark : colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <SubScreenHeader title={t('places')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segmented} accessibilityRole="tablist">
          {(['makkah', 'madinah'] as City[]).map((c) => {
            const active = city === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setChosenCity(c)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, { fontSize: fonts.md }, active && styles.segmentTextActive]}>
                  {t(c)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {places.map(({ place, distance }) => (
          <View key={place.id} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name={place.icon as keyof typeof Ionicons.glyphMap} size={24} color={iconColor(place.kind)} />
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[styles.name, { fontSize: fonts.md, textAlign: isRTL ? 'right' : 'left' }]}>
                  {place.name[language]}
                </Text>
                {distance !== null && (
                  <Text style={[styles.distance, { fontSize: fonts.xs }]}>{formatDistance(distance)}</Text>
                )}
              </View>
              <Text style={[styles.description, { fontSize: fonts.sm, textAlign: isRTL ? 'right' : 'left' }]}>
                {place.description[language]}
              </Text>
              <TouchableOpacity style={styles.directions} onPress={() => open(directionsUrl(place))}>
                <Ionicons name="navigate" size={16} color={colors.textLight} />
                <Text style={[styles.directionsText, { fontSize: fonts.sm }]}>{t('directions')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('emergency_numbers')}</Text>
        <View style={styles.emergencyRow}>
          {EMERGENCY_NUMBERS.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.emergency}
              onPress={() => open(`tel:${e.number}`)}
              accessibilityRole="button"
              accessibilityLabel={`${e.label[language]} ${e.number}`}
            >
              <Ionicons name="call" size={20} color={colors.textLight} />
              <View>
                <Text style={[styles.emergencyNumber, { fontSize: fonts.xl }]}>{e.number}</Text>
                <Text style={[styles.emergencyLabel, { fontSize: fonts.xs }]}>{e.label[language]}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.hint, { fontSize: fonts.xs }]}>{t('places_hint')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    segmented: {
      flexDirection: 'row',
      backgroundColor: c.surfaceAlt,
      borderRadius: BORDER_RADIUS.round,
      padding: 4,
      marginBottom: SPACING.md,
    },
    segment: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round, alignItems: 'center' },
    segmentActive: { backgroundColor: c.primary },
    segmentText: { color: c.text, fontWeight: '600' },
    segmentTextActive: { color: c.textLight },
    card: {
      flexDirection: 'row',
      gap: SPACING.md,
      backgroundColor: c.surface,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
    name: { flex: 1, color: c.text, fontWeight: '700' },
    distance: { color: c.primary, fontWeight: '700' },
    description: { color: c.textSecondary, marginTop: 2, lineHeight: 20 },
    directions: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: SPACING.xs,
      backgroundColor: c.primary,
      paddingVertical: 6,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      marginTop: SPACING.sm,
    },
    directionsText: { color: c.textLight, fontWeight: '700' },
    sectionTitle: { color: c.text, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.sm },
    emergencyRow: { flexDirection: 'row', gap: SPACING.sm },
    emergency: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: c.error,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
    },
    emergencyNumber: { color: c.textLight, fontWeight: 'bold' },
    emergencyLabel: { color: c.textLight },
    hint: { color: c.textSecondary, textAlign: 'center', marginTop: SPACING.lg },
  });
