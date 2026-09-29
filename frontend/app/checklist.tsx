import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { SPACING, BORDER_RADIUS, FONT_SIZES, Palette } from '../constants/theme';
import {
  CHECKLIST,
  ChecklistState,
  EMPTY_CHECKLIST,
  addCustomItem,
  parseChecklist,
  removeCustomItem,
  toggleChecked,
} from '../data/checklist';

const STORAGE_KEY = 'travel_checklist';

export default function ChecklistScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, language, isRTL } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [state, setState] = useState<ChecklistState>(EMPTY_CHECKLIST);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setState(parseChecklist(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [loaded, state]);

  const total = CHECKLIST.reduce((n, c) => n + c.items.length, 0) + state.custom.length;
  const done = state.checked.length;
  const percent = total ? Math.round((100 * done) / total) : 0;

  const toggle = (id: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    setState((s) => toggleChecked(s, id));
  };

  const add = () => {
    setState((s) => addCustomItem(s, draft, `custom-${Date.now()}`));
    setDraft('');
  };

  const uncheckAll = () => {
    const apply = () => setState((s) => ({ ...s, checked: [] }));
    if (Platform.OS === 'web') return apply();
    Alert.alert(t('uncheck_all'), t('uncheck_all_confirm'), [
      { text: t('no'), style: 'cancel' },
      { text: t('yes'), style: 'destructive', onPress: apply },
    ]);
  };

  const Row = ({ id, label, onDelete }: { id: string; label: string; onDelete?: () => void }) => {
    const checked = state.checked.includes(id);
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.rowMain}
          onPress={() => toggle(id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
        >
          <Ionicons
            name={checked ? 'checkbox' : 'square-outline'}
            size={24}
            color={checked ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.rowText,
              { fontSize: fonts.md, textAlign: isRTL ? 'right' : 'left' },
              checked && styles.rowTextDone,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.delete} accessibilityLabel={t('delete')}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <SubScreenHeader
        title={t('checklist')}
        right={
          <TouchableOpacity onPress={uncheckAll} accessibilityRole="button" accessibilityLabel={t('uncheck_all')}>
            <Ionicons name="refresh" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.progressCard}>
          <Text style={[styles.progressText, { fontSize: fonts.md }]}>
            {done} / {total} {t('items_ready')}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>

        {CHECKLIST.map((category) => (
          <View key={category.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{category.title[language]}</Text>
              <Text style={[styles.sectionCount, { fontSize: fonts.xs }]}>
                {category.items.filter((i) => state.checked.includes(i.id)).length}/{category.items.length}
              </Text>
            </View>
            <View style={styles.card}>
              {category.items.map((item) => (
                <Row key={item.id} id={item.id} label={item.label[language]} />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { fontSize: fonts.lg }]}>{t('my_items')}</Text>
          </View>
          <View style={styles.card}>
            {state.custom.map((item) => (
              <Row
                key={item.id}
                id={item.id}
                label={item.text}
                onDelete={() => setState((s) => removeCustomItem(s, item.id))}
              />
            ))}
            <View style={styles.addRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={add}
                placeholder={t('add_item')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { fontSize: fonts.md, textAlign: isRTL ? 'right' : 'left' }]}
                maxLength={120}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, !draft.trim() && styles.addButtonDisabled]}
                onPress={add}
                disabled={!draft.trim()}
                accessibilityLabel={t('add')}
              >
                <Ionicons name="add" size={22} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    progressCard: { backgroundColor: c.primary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
    progressText: { color: c.textLight, fontWeight: '700', marginBottom: SPACING.sm },
    progressTrack: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: c.gold, borderRadius: 5 },
    section: { marginTop: SPACING.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    sectionTitle: { flex: 1, fontWeight: '700', color: c.text },
    sectionCount: { color: c.textSecondary, fontWeight: '600' },
    card: { backgroundColor: c.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: c.border },
    row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border },
    rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
    rowText: { flex: 1, color: c.text },
    rowTextDone: { color: c.textSecondary, textDecorationLine: 'line-through' },
    delete: { padding: SPACING.md },
    addRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm },
    input: {
      flex: 1,
      color: c.text,
      backgroundColor: c.surfaceAlt,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    addButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonDisabled: { opacity: 0.4 },
  });
