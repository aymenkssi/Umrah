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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../../constants/theme';
import duasData from '../../data/general-duas.json';

export default function DuasScreen() {
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
    comprehensive: COLORS.primary,
    protection: '#2196F3',
    forgiveness: '#9C27B0',
    guidance: '#FF9800',
    provision: '#4CAF50',
    steadfastness: '#F44336',
    jannah: COLORS.gold,
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
          {language === 'ar' ? 'الأدعية' : language === 'fr' ? 'Invocations' : 'Supplications'}
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
              { borderLeftColor: categoryColors[category.id] || COLORS.primary },
            ]}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: categoryColors[category.id] || COLORS.primary },
              ]}
            >
              <Ionicons
                name={categoryIcons[category.id] as any}
                size={28}
                color={COLORS.textLight}
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={[styles.categoryTitle, { fontSize: fonts.lg }]}>
                {category.category[language]}
              </Text>
              <Text style={[styles.categoryCount, { fontSize: fonts.sm }]}>
                {category.duas.length} {language === 'ar' ? 'دعاء' : language === 'fr' ? 'invocations' : 'supplications'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
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
              <Ionicons name="close" size={28} color={COLORS.text} />
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
                  <Ionicons name="eye" size={16} color={COLORS.primary} />
                  <Text style={[styles.viewMore, { fontSize: fonts.sm }]}>
                    {language === 'ar' ? 'اضغط للتفاصيل' : language === 'fr' ? 'Appuyez pour les détails' : 'Tap for details'}
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
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { fontSize: fonts.lg }]}>
              {language === 'ar' ? 'تفاصيل الدعاء' : language === 'fr' ? 'Détails' : 'Details'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.duaDetail} contentContainerStyle={{ padding: SPACING.lg }}>
            {/* Arabic Text */}
            <View style={styles.duaSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book" size={20} color={COLORS.primary} />
                <Text style={[styles.sectionTitle, { fontSize: fonts.md }]}>
                  {language === 'ar' ? 'الدعاء بالعربية' : language === 'fr' ? 'En arabe' : 'Arabic'}
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
                  <Ionicons name="text" size={20} color={COLORS.goldDark} />
                  <Text style={[styles.sectionTitle, { fontSize: fonts.md }]}>
                    {language === 'ar' ? 'النطق' : language === 'fr' ? 'Translittération' : 'Transliteration'}
                  </Text>
                </View>
                <Text style={[styles.duaTranslitLarge, { fontSize: fonts.lg }]}>
                  {selectedDua.transliteration}
                </Text>
              </View>
            )}

            {/* Translation */}
            {selectedDua?.translation && (
              <View style={styles.duaSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="language" size={20} color={COLORS.success} />
                  <Text style={[styles.sectionTitle, { fontSize: fonts.md }]}>
                    {language === 'ar' ? 'الترجمة' : language === 'fr' ? 'Traduction' : 'Translation'}
                  </Text>
                </View>
                <Text style={[styles.duaTranslation, { fontSize: fonts.md }]}>
                  {selectedDua.translation[language === 'ar' ? 'en' : language]}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  duasList: {
    flex: 1,
  },
  duaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  duaArabic: {
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  duaTranslit: {
    color: COLORS.textSecondary,
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
    color: COLORS.primary,
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
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  duaArabicLarge: {
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 40,
    textAlign: 'right',
  },
  duaTranslitLarge: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  duaTranslation: {
    color: COLORS.text,
    lineHeight: 24,
  },
});
