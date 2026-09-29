import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, Palette } from '../../constants/theme';
import duasData from '../../data/general-duas.json';
import { useTheme, useThemedStyles } from '../../contexts/ThemeContext';

export default function DuasScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedDua, setSelectedDua] = useState<any>(null);

  const categoryIcons: Record<string, string> = {
    comprehensive: 'heart',
    protection: 'shield-checkmark',
    forgiveness: 'heart-dislike',
    guidance: 'compass',
    provision: 'gift',
    steadfastness: 'fitness',
    jannah: 'sparkles',
    prosperity: 'trending-up',
  };

  const categoryColors: Record<string, string> = {
    comprehensive: colors.primary,
    protection: '#2196F3',
    forgiveness: '#9C27B0',
    guidance: '#FF9800',
    provision: '#4CAF50',
    steadfastness: '#F44336',
    jannah: colors.gold,
    prosperity: '#00BCD4',
  };

  const handleCategoryPress = (category: any) => {
    setSelectedCategory(category);
  };

  const handleDuaPress = (dua: any) => {
    setSelectedDua(dua);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: fonts.xxl }]}>
          {t('duas')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {duasData.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              { borderLeftColor: categoryColors[category.id] || colors.primary },
            ]}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: categoryColors[category.id] || colors.primary },
              ]}
            >
              <Ionicons
                name={categoryIcons[category.id] as any}
                size={28}
                color={colors.textLight}
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={[styles.categoryTitle, { fontSize: fonts.lg }]}>
                {category.category[language]}
              </Text>
              <Text style={[styles.categoryCount, { fontSize: fonts.sm }]}>
                {category.duas.length} {t('duas_count')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={selectedCategory !== null}
        animationType="slide"
        onRequestClose={() => setSelectedCategory(null)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { fontSize: fonts.xl }]}>
              {selectedCategory?.category[language]}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.duasList} contentContainerStyle={{ padding: SPACING.md }}>
            {selectedCategory?.duas.map((dua: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.duaCard}
                onPress={() => handleDuaPress(dua)}
                activeOpacity={0.8}
              >
                <Text style={[styles.duaArabic, { fontSize: fonts.xl }]}>
                  {dua.arabic}
                </Text>
                {dua.transliteration && (
                  <Text style={[styles.duaTranslit, { fontSize: fonts.sm }]}>
                    {dua.transliteration}
                  </Text>
                )}
                <View style={styles.duaFooter}>
                  <Ionicons name="eye" size={16} color={colors.primary} />
                  <Text style={[styles.viewMore, { fontSize: fonts.sm }]}>
                    {t('tap_for_details')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Dua Detail Modal */}
      <Modal
        visible={selectedDua !== null}
        animationType="fade"
        onRequestClose={() => setSelectedDua(null)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedDua(null)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { fontSize: fonts.lg }]}>
              {t('dua_details')}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.duaDetail} contentContainerStyle={{ padding: SPACING.lg }}>
            {/* Arabic Text */}
            <View style={styles.duaSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { fontSize: fonts.md }]}>
                  {t('arabic_text')}
                </Text>
              </View>
              <Text style={[styles.duaArabicLarge, { fontSize: fonts.xxl }]}>
                {selectedDua?.arabic}
              </Text>
            </View>

            {/* Transliteration */}
            {selectedDua?.transliteration && (
              <View style={styles.duaSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="text" size={20} color={colors.goldDark} />
                  <Text style={[styles.sectionTitle, { fontSize: fonts.md }]}>
                    {t('transliteration')}
                  </Text>
                </View>
                <Text style={[styles.duaTranslitLarge, { fontSize: fonts.lg }]}>
                  {selectedDua.transliteration}
                </Text>
              </View>
            )}

            {/* Translation */}
            {/* The Arabic text is already shown above, so no translation in Arabic mode */}
            {selectedDua?.translation && language !== 'ar' && (
              <View style={styles.duaSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="language" size={20} color={colors.success} />
                  <Text style={[styles.sectionTitle, { fontSize: fonts.md }]}>
                    {t('translation')}
                  </Text>
                </View>
                <Text style={[styles.duaTranslation, { fontSize: fonts.md }]}>
                  {selectedDua.translation[language]}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: 'bold',
    color: c.text,
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    color: c.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: c.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: c.text,
  },
  duasList: {
    flex: 1,
  },
  duaCard: {
    backgroundColor: c.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: c.primary,
    ...SHADOWS.small,
  },
  duaArabic: {
    fontWeight: '600',
    color: c.text,
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  duaTranslit: {
    color: c.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  duaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  viewMore: {
    color: c.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  duaDetail: {
    flex: 1,
  },
  duaSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: c.text,
    marginLeft: SPACING.sm,
  },
  duaArabicLarge: {
    fontWeight: '600',
    color: c.text,
    lineHeight: 40,
    textAlign: 'right',
  },
  duaTranslitLarge: {
    color: c.textSecondary,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  duaTranslation: {
    color: c.text,
    lineHeight: 24,
  },
});
