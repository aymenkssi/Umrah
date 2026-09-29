import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { FONT_SIZES, SPACING, Palette } from '../constants/theme';

interface SubScreenHeaderProps {
  title: string;
  /** Optional button on the right (e.g. reset). */
  right?: ReactNode;
}

/** Header with a back button, for screens opened on top of the tabs. */
export const SubScreenHeader: React.FC<SubScreenHeaderProps> = ({ title, right }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, isRTL } = useLanguage();
  const { fontSize } = useSettings();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={styles.iconButton} accessibilityRole="button" accessibilityLabel={t('back')}>
        <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { fontSize: FONT_SIZES[fontSize].xl }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.iconButton}>{right}</View>
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: c.text },
  });
