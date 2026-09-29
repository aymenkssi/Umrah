import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { useSettings, FontSize } from '../../contexts/SettingsContext';
import { useAds } from '../../contexts/AdsContext';
import { PRIVACY_POLICY_URL } from '../../constants/api';
import { loadAnalyticsEnabled, setAnalyticsEnabled } from '../../utils/analytics';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../../constants/theme';
import { AdBanner } from '../../components/AdBanner';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { fontSize, setFontSize, resetProgress } = useSettings();
  const { privacyOptionsRequired, showPrivacyOptions } = useAds();
  const [analyticsOn, setAnalyticsOn] = useState(true);

  useEffect(() => {
    loadAnalyticsEnabled().then(setAnalyticsOn);
  }, []);

  const handleAnalyticsChange = (value: boolean) => {
    setAnalyticsOn(value);
    setAnalyticsEnabled(value).catch((error) => console.error('Error saving analytics setting:', error));
  };
  const fonts = FONT_SIZES[fontSize];

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  const handleFontSizeChange = async (size: FontSize) => {
    await setFontSize(size);
  };

  const handleResetProgress = () => {
    Alert.alert(
      t('reset_progress'),
      t('reset_confirm'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            Alert.alert(t('success'), t('progress_reset_done'));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: fonts.xxl }]}>{t('settings')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('language')}</Text>
          <View style={styles.optionsContainer}>
            {(['ar', 'en', 'fr'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.optionButton,
                  language === lang && styles.optionButtonActive,
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { fontSize: fonts.md },
                    language === lang && styles.optionTextActive,
                  ]}
                >
                  {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'Français'}
                </Text>
                {language === lang && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.textLight} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Font Size Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('font_size')}</Text>
          <View style={styles.optionsContainer}>
            {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  fontSize === size && styles.optionButtonActive,
                ]}
                onPress={() => handleFontSizeChange(size)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { fontSize: fonts.md },
                    fontSize === size && styles.optionTextActive,
                  ]}
                >
                  {t(size)}
                </Text>
                {fontSize === size && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.textLight} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Donate Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('support_app')}</Text>
          
          <View style={styles.donateCard}>
            <Ionicons name="heart" size={32} color={COLORS.error} />
            <Text style={[styles.donateMessage, { fontSize: fonts.md }]}>
              {t('donate_message')}
            </Text>
            <TouchableOpacity
              style={styles.donateButton}
              onPress={() => {
                Linking.openURL('https://www.paypal.com/paypalme/WalkingInTunisia').catch((error) =>
                  console.error('Error opening PayPal:', error)
                );
              }}
            >
              <Ionicons name="logo-paypal" size={20} color={COLORS.textLight} />
              <Text style={[styles.donateButtonText, { fontSize: fonts.md }]}>
                {t('donate_via_paypal')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Progress */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetProgress}
          >
            <Ionicons name="refresh" size={20} color={COLORS.error} />
            <Text style={[styles.dangerButtonText, { fontSize: fonts.md }]}>
              {t('reset_progress')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('about')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { fontSize: fonts.md }]}>{t('privacy')}</Text>
                <Text style={[styles.infoText, { fontSize: fonts.sm }]}>
                  {t('privacy_desc')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() =>
                Linking.openURL(PRIVACY_POLICY_URL).catch((error) =>
                  console.error('Error opening privacy policy:', error)
                )
              }
            >
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.linkButtonText, { fontSize: fonts.sm }]}>{t('privacy_policy')}</Text>
            </TouchableOpacity>
            {privacyOptionsRequired && (
              <TouchableOpacity style={styles.linkButton} onPress={showPrivacyOptions}>
                <Ionicons name="options-outline" size={18} color={COLORS.primary} />
                <Text style={[styles.linkButtonText, { fontSize: fonts.sm }]}>
                  {t('ad_privacy_options')}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.switchRow}>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { fontSize: fonts.md }]}>{t('analytics_title')}</Text>
                <Text style={[styles.infoText, { fontSize: fonts.sm }]}>{t('analytics_desc')}</Text>
              </View>
              <Switch
                value={analyticsOn}
                onValueChange={handleAnalyticsChange}
                trackColor={{ true: COLORS.primaryLight, false: COLORS.border }}
                thumbColor={analyticsOn ? COLORS.primary : COLORS.surfaceAlt}
                accessibilityLabel={t('analytics_title')}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.goldDark} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { fontSize: fonts.md }]}>{t('disclaimer')}</Text>
                <Text style={[styles.infoText, { fontSize: fonts.sm }]}>
                  {t('disclaimer_desc')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.versionCard}>
            <Text style={[styles.versionText, { fontSize: fonts.sm }]}>
              {t('app_version')}: {APP_VERSION}
            </Text>
          </View>
        </View>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.textLight,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.error,
    ...SHADOWS.small,
  },
  dangerButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    marginLeft: SPACING.lg + SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  linkButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  versionCard: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  versionText: {
    color: COLORS.textSecondary,
  },
  donateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  donateMessage: {
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SPACING.md,
    lineHeight: 22,
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0070BA',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  donateButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});