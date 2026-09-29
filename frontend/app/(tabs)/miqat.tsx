import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, Palette } from '../../constants/theme';
import { AdBanner } from '../../components/AdBanner';
import { calculateDistance } from '../../utils/calculations';
import { useCoords } from '../../hooks/useCoords';
import miqatData from '../../data/miqat.json';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';

type LocalizedText = Record<Language, string>;

interface Miqat {
  id: string;
  name: LocalizedText;
  notes: LocalizedText;
  lat: number;
  lng: number;
  phone?: string;
  isForMakkah?: boolean;
  distance: number | null;
}

// Lower-case and strip Latin accents and Arabic harakat so searches ignore them.
const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '')
    .toLowerCase()
    .trim();

export default function MiqatScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];

  const { status, coords } = useCoords();
  const [searchQuery, setSearchQuery] = useState('');
  const loading = status === 'loading';
  const hasLocation = status === 'ready';

  const miqatList = useMemo<Miqat[]>(() => {
    const all = miqatData as Omit<Miqat, 'distance'>[];
    if (!coords) return all.map((m) => ({ ...m, distance: null }));
    return all
      .map((m) => ({ ...m, distance: calculateDistance(coords.latitude, coords.longitude, m.lat, m.lng) }))
      .sort((a, b) => a.distance - b.distance);
  }, [coords]);

  const deniedShown = useRef(false);
  useEffect(() => {
    if (status === 'denied' && !deniedShown.current) {
      deniedShown.current = true;
      Alert.alert(t('permission_denied'), t('permission_denied_desc'));
    }
  }, [status, t]);

  const handleNavigate = (miqat: Miqat) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${miqat.lat},${miqat.lng}`;
    Linking.openURL(url).catch((error) => console.error('Error opening maps:', error));
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch((error) =>
      console.error('Error opening dialer:', error)
    );
  };

  const query = normalizeSearch(searchQuery);
  const filteredMiqats = query
    ? miqatList.filter((miqat) =>
        Object.values(miqat.name).some((name) => normalizeSearch(name).includes(query))
      )
    : miqatList;

  const makkahMiqat = miqatList.find((m) => m.isForMakkah);
  // Nearest of the five main mawaqit, independent of the search box.
  const nearestMiqat = hasLocation ? miqatList.find((m) => !m.isForMakkah) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: fonts.xxl }]}>{t('miqat')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { fontSize: fonts.md }]}>{t('loading')}</Text>
          </View>
        ) : (
          <>
            {/* Makkah Residents Special Card */}
            {makkahMiqat && (
              <View style={[styles.card, styles.makkahCard]}>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, { backgroundColor: colors.goldBg }]}>
                    <Ionicons name="home" size={16} color={colors.primary} />
                    <Text style={[styles.badgeText, { fontSize: fonts.sm, color: colors.primary }]}>
                      {t('for_makkah_residents')}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.nearestTitle, { fontSize: fonts.xl }]}>
                  {makkahMiqat.name[language]}
                </Text>
                <Text style={[styles.notesText, { fontSize: fonts.sm }]}>
                  {makkahMiqat.notes[language]}
                </Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.navigateButton]}
                    onPress={() => handleNavigate(makkahMiqat)}
                  >
                    <Ionicons name="navigate" size={20} color={colors.textLight} />
                    <Text style={[styles.actionButtonText, { fontSize: fonts.md }]}>
                      {t('navigate')}
                    </Text>
                  </TouchableOpacity>
                  {makkahMiqat.phone && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.callButton]}
                      onPress={() => handleCall(makkahMiqat.phone!)}
                    >
                      <Ionicons name="call" size={20} color={colors.onGold} />
                      <Text style={[styles.actionButtonText, { fontSize: fonts.md, color: colors.onGold }]}>
                        {t('call')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Nearest Miqat Card */}
            {nearestMiqat && (
              <View style={[styles.card, styles.nearestCard]}>
                <View style={styles.badgeContainer}>
                  <View style={styles.badge}>
                    <Ionicons name="star" size={16} color={colors.gold} />
                    <Text style={[styles.badgeText, { fontSize: fonts.sm }]}>
                      {t('nearest_miqat')}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.nearestTitle, { fontSize: fonts.xl }]}>
                  {nearestMiqat.name[language]}
                </Text>

                {nearestMiqat.distance !== null && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="navigate" size={20} color={colors.primary} />
                    <Text style={[styles.distanceText, { fontSize: fonts.lg }]}>
                      {nearestMiqat.distance} {t('km')}
                    </Text>
                  </View>
                )}

                <Text style={[styles.notesText, { fontSize: fonts.sm }]}>
                  {nearestMiqat.notes[language]}
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.navigateButton]}
                    onPress={() => handleNavigate(nearestMiqat)}
                  >
                    <Ionicons name="navigate" size={20} color={colors.textLight} />
                    <Text style={[styles.actionButtonText, { fontSize: fonts.md }]}>
                      {t('navigate')}
                    </Text>
                  </TouchableOpacity>

                  {nearestMiqat.phone && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.callButton]}
                      onPress={() => handleCall(nearestMiqat.phone!)}
                    >
                      <Ionicons name="call" size={20} color={colors.onGold} />
                      <Text style={[styles.actionButtonText, { fontSize: fonts.md, color: colors.onGold }]}>
                        {t('call')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { fontSize: fonts.md }]}
                placeholder={t('search_miqat')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* All Miqat List */}
            <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('all_miqat')}</Text>

            {filteredMiqats.map((miqat) => (
              <View key={miqat.id} style={styles.miqatCard}>
                <View style={styles.miqatHeader}>
                  <View style={styles.miqatInfo}>
                    <Text style={[styles.miqatName, { fontSize: fonts.lg }]}>
                      {miqat.name[language]}
                    </Text>
                    {miqat.distance !== null && (
                      <View style={styles.miqatDistance}>
                        <Ionicons name="location" size={16} color={colors.primary} />
                        <Text style={[styles.miqatDistanceText, { fontSize: fonts.sm }]}>
                          {miqat.distance} {t('km')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={[styles.miqatNotes, { fontSize: fonts.sm }]}>
                  {miqat.notes[language]}
                </Text>

                <View style={styles.miqatActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleNavigate(miqat)}
                  >
                    <Ionicons name="navigate" size={24} color={colors.primary} />
                  </TouchableOpacity>

                  {miqat.phone && (
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleCall(miqat.phone!)}
                    >
                      <Ionicons name="call" size={24} color={colors.goldDark} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {filteredMiqats.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { fontSize: fonts.md }]}>{t('no_results')}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    backgroundColor: c.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: c.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: c.textSecondary,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  nearestCard: {
    borderWidth: 2,
    borderColor: c.gold,
  },
  makkahCard: {
    borderWidth: 2,
    borderColor: c.primary,
    backgroundColor: c.successBg,
  },
  badgeContainer: {
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.goldBg,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  badgeText: {
    color: c.goldDark,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  nearestTitle: {
    fontWeight: 'bold',
    color: c.text,
    marginBottom: SPACING.sm,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  distanceText: {
    fontWeight: 'bold',
    color: c.primary,
    marginLeft: SPACING.xs,
  },
  notesText: {
    color: c.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  navigateButton: {
    backgroundColor: c.primary,
  },
  callButton: {
    backgroundColor: c.gold,
  },
  actionButtonText: {
    fontWeight: '600',
    color: c.textLight,
    marginLeft: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: c.text,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: c.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  miqatCard: {
    backgroundColor: c.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  miqatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  miqatInfo: {
    flex: 1,
  },
  miqatName: {
    fontWeight: 'bold',
    color: c.text,
    marginBottom: SPACING.xs,
  },
  miqatDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miqatDistanceText: {
    color: c.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  miqatNotes: {
    color: c.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  miqatActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: c.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    color: c.textSecondary,
  },
});
