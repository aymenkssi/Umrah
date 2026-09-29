import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, Palette } from '../../constants/theme';
import umrahSteps from '../../data/umrah-steps.json';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';

// Sorted once, without mutating the imported JSON module.
const STEPS = [...umrahSteps].sort((a, b) => a.order - b.order);

export default function GuideScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language } = useLanguage();
  const { fontSize, completedSteps, toggleStepCompletion, detailedView, toggleView } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const handleStepPress = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: fonts.xxl }]}>{t('guide')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={toggleView}
          >
            <Ionicons
              name={detailedView ? 'list' : 'list-circle'}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.viewToggleText, { fontSize: fonts.sm }]}>
              {detailedView ? t('compact_view') : t('detailed_view')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {STEPS.map((step: any) => {
            const isCompleted = completedSteps.includes(step.id);
            const isExpanded = expandedStep === step.id;
            const isSpecial = step.isSpecial;

            return (
              <View
                key={step.id}
                style={[
                  styles.stepCard,
                  isSpecial && styles.specialCard,
                  isCompleted && styles.completedCard,
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleStepPress(step.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.stepHeader}>
                    <View style={styles.stepHeaderLeft}>
                      <View
                        style={[
                          styles.stepNumber,
                          isCompleted && styles.stepNumberCompleted,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={18} color={colors.textLight} />
                        ) : (
                          <Text style={styles.stepNumberText}>{step.order}</Text>
                        )}
                      </View>
                      <View style={styles.stepTitleContainer}>
                        <Text style={[styles.stepTitle, { fontSize: fonts.lg }]}>
                          {step.title[language]}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>

                  <Text
                    style={[styles.stepSummary, { fontSize: fonts.md }]}
                    numberOfLines={detailedView || isExpanded ? undefined : 2}
                  >
                    {step.summary[language]}
                  </Text>
                </TouchableOpacity>

                {(isExpanded || detailedView) && (
                  <View style={styles.stepDetails}>
                    {step.details && (
                      <View style={styles.detailSection}>
                        <Text style={[styles.detailText, { fontSize: fonts.md }]}>
                          {step.details[language]}
                        </Text>
                      </View>
                    )}

                    {step.dua && (
                      <View style={styles.duaSection}>
                        <View style={styles.duaHeader}>
                          <Ionicons name="book-outline" size={20} color={colors.primary} />
                          <Text style={[styles.duaLabel, { fontSize: fonts.sm }]}>{t('dua')}</Text>
                        </View>
                        <Text style={[styles.duaText, { fontSize: fonts.md }]}>
                          {step.dua[language]}
                        </Text>
                      </View>
                    )}

                    {step.additionalDuas?.length > 0 && (
                      <View style={styles.duaSection}>
                        <View style={styles.duaHeader}>
                          <Ionicons name="bookmarks-outline" size={20} color={colors.primary} />
                          <Text style={[styles.duaLabel, { fontSize: fonts.sm }]}>
                            {t('additional_duas')}
                          </Text>
                        </View>
                        {step.additionalDuas.map((extra: any, index: number) => (
                          <View key={index} style={index > 0 ? styles.additionalDua : undefined}>
                            {language !== 'ar' && extra.ar && (
                              <Text style={[styles.duaArabic, { fontSize: fonts.lg }]}>{extra.ar}</Text>
                            )}
                            <Text style={[styles.duaText, { fontSize: fonts.md }]}>{extra[language]}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {step.notes && (
                      <View style={styles.notesSection}>
                        <View style={styles.notesHeader}>
                          <Ionicons name="information-circle-outline" size={18} color={colors.goldDark} />
                          <Text style={[styles.notesLabel, { fontSize: fonts.sm }]}>
                            {t('notes')}:
                          </Text>
                        </View>
                        <Text style={[styles.notesText, { fontSize: fonts.sm }]}>
                          {step.notes[language]}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    isCompleted && styles.completeButtonActive,
                  ]}
                  onPress={() => toggleStepCompletion(step.id)}
                >
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={20}
                    color={isCompleted ? colors.textLight : colors.primary}
                  />
                  <Text
                    style={[
                      styles.completeButtonText,
                      { fontSize: fonts.sm },
                      isCompleted && styles.completeButtonTextActive,
                    ]}
                  >
                    {isCompleted ? t('mark_incomplete') : t('mark_complete')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

        <View style={styles.disclaimerCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.disclaimerText, { fontSize: fonts.sm }]}>
            {t('disclaimer_desc')}
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: c.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
  },
  viewToggleText: {
    marginLeft: SPACING.xs,
    color: c.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  stepCard: {
    backgroundColor: c.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
  },
  specialCard: {
    borderLeftColor: c.gold,
    backgroundColor: c.goldBg,
  },
  completedCard: {
    opacity: 0.8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: c.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberCompleted: {
    backgroundColor: c.success,
  },
  stepNumberText: {
    color: c.textLight,
    fontWeight: 'bold',
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    color: c.text,
  },
  stepSummary: {
    color: c.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  stepDetails: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  detailSection: {
    marginBottom: SPACING.md,
  },
  detailText: {
    color: c.text,
    lineHeight: 24,
  },
  duaSection: {
    backgroundColor: c.surfaceAlt,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  duaLabel: {
    fontWeight: '600',
    color: c.primary,
    marginLeft: SPACING.xs,
  },
  duaText: {
    color: c.text,
    lineHeight: 24,
    fontWeight: '500',
  },
  duaArabic: {
    color: c.primaryDark,
    lineHeight: 30,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: SPACING.xs,
  },
  additionalDua: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  notesSection: {
    backgroundColor: c.goldBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: c.goldDark,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  notesLabel: {
    fontWeight: '600',
    color: c.goldDark,
    marginLeft: SPACING.xs,
  },
  notesText: {
    color: c.text,
    lineHeight: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: c.primary,
    marginTop: SPACING.sm,
  },
  completeButtonActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  completeButtonText: {
    marginLeft: SPACING.xs,
    color: c.primary,
    fontWeight: '600',
  },
  completeButtonTextActive: {
    color: c.textLight,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: c.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
  },
  disclaimerText: {
    flex: 1,
    color: c.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
});