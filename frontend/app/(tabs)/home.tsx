import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../../constants/theme';
import { IslamicPattern, IslamicBorder } from '../../components/IslamicPattern';
import umrahSteps from '../../data/umrah-steps.json';

const TOTAL_STEPS = umrahSteps.length;
const STEP_IDS = new Set(umrahSteps.map((step) => step.id));

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const { fontSize, completedSteps } = useSettings();
  const fonts = FONT_SIZES[fontSize];

  // Ignore ids of steps that may have been removed from the guide since they were saved.
  const doneCount = completedSteps.filter((id) => STEP_IDS.has(id)).length;
  const progressPercentage = Math.min(100, (doneCount / TOTAL_STEPS) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Islamic Pattern */}
        <View style={styles.header}>
          <View style={styles.patternContainer}>
            <IslamicPattern width={150} height={150} opacity={0.15} />
          </View>
          <Text style={[styles.title, { fontSize: fonts.xxxl, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('welcome_title')}
          </Text>
          <Text style={[styles.subtitle, { fontSize: fonts.md, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('welcome_subtitle')}
          </Text>
          <IslamicBorder style={{ marginTop: SPACING.lg }} />
        </View>

        {/* Progress Card */}
        {doneCount > 0 && (
          <View style={[styles.card, styles.progressCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              <Text style={[styles.cardTitle, { fontSize: fonts.lg }]}>{t('progress')}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={[styles.progressText, { fontSize: fonts.sm }]}>
              {doneCount} / {TOTAL_STEPS} {t('step_completed')}
            </Text>
          </View>
        )}

        {/* Main Action Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryCard]}
            onPress={() => router.push('/guide')}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardIcon}>
              <Ionicons name="book" size={32} color={COLORS.textLight} />
            </View>
            <Text style={[styles.actionCardTitle, { fontSize: fonts.xl }]}>
              {t('start_guide')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.secondaryCard]}
            onPress={() => router.push('/miqat')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionCardIcon, { backgroundColor: COLORS.goldDark }]}>
              <Ionicons name="location" size={32} color={COLORS.text} />
            </View>
            <Text style={[styles.actionCardTitle, { fontSize: fonts.xl, color: COLORS.text }]}>
              {t('find_miqat')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push('/prayer-times')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="time" size={28} color={COLORS.textLight} />
            </View>
            <Text style={[styles.featureTitle, { fontSize: fonts.md }]}>
              {t('view_prayer_times')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push('/qibla')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIcon, { backgroundColor: COLORS.gold }]}>
              <Ionicons name="compass" size={28} color={COLORS.text} />
            </View>
            <Text style={[styles.featureTitle, { fontSize: fonts.md }]}>
              {t('find_qibla')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.wideFeatureCard}
          onPress={() => router.push('/duas')}
          activeOpacity={0.8}
        >
          <View style={[styles.featureIcon, styles.wideFeatureIcon, { backgroundColor: COLORS.primaryDark }]}>
            <Ionicons name="heart" size={28} color={COLORS.textLight} />
          </View>
          <Text style={[styles.featureTitle, { fontSize: fonts.md }]}>{t('duas')}</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.disclaimerText, { fontSize: fonts.sm }]}>
            {t('disclaimer_desc')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  patternContainer: {
    position: 'absolute',
    right: -30,
    top: -20,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.goldLight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    ...SHADOWS.small,
  },
  progressCard: {
    marginTop: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  actionCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  primaryCard: {
    backgroundColor: COLORS.primary,
  },
  secondaryCard: {
    backgroundColor: COLORS.gold,
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionCardTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  featuresGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureTitle: {
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  wideFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    ...SHADOWS.small,
  },
  wideFeatureIcon: {
    marginBottom: 0,
    marginRight: SPACING.md,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    margin: SPACING.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
});