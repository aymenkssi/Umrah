import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING, Palette } from '../constants/theme';
import {
  AppMessage,
  dismissKey,
  fetchMessages,
  loadCachedMessages,
  loadDismissed,
  saveDismissed,
} from '../utils/appMessages';

const ICONS: Record<AppMessage['kind'], keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  tip: 'bulb',
  warning: 'warning',
};

/** Announcements published from the admin page, shown on the home screen. */
export const AppMessages: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { language, t, isRTL } = useLanguage();
  const { fontSize } = useSettings();
  const fonts = FONT_SIZES[fontSize];
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadDismissed().then((keys) => !cancelled && setDismissed(keys));
    loadCachedMessages(language).then((cached) => !cancelled && setMessages(cached));
    fetchMessages(language)
      .then((fresh) => !cancelled && setMessages(fresh))
      .catch(() => {
        // Offline or server unreachable: keep the cached messages.
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const dismiss = (m: AppMessage) => {
    const next = [...dismissed, dismissKey(m)];
    setDismissed(next);
    saveDismissed(next).catch(() => {});
  };

  const visible = messages.filter((m) => !dismissed.includes(dismissKey(m)));
  if (!visible.length) return null;

  const tone = (kind: AppMessage['kind']) =>
    kind === 'warning'
      ? { bg: colors.warningBg, fg: colors.warning }
      : kind === 'tip'
        ? { bg: colors.successBg, fg: colors.success }
        : { bg: colors.surface, fg: colors.info };

  return (
    <View style={styles.list}>
      {visible.map((m) => {
        const { bg, fg } = tone(m.kind);
        return (
          <View key={m.id} style={[styles.card, { backgroundColor: bg, borderColor: fg }]} accessibilityRole="alert">
            <Ionicons name={ICONS[m.kind]} size={22} color={fg} />
            <View style={styles.body}>
              <Text style={[styles.title, { fontSize: fonts.md, textAlign: isRTL ? 'right' : 'left' }]}>{m.title}</Text>
              {!!m.body && (
                <Text style={[styles.text, { fontSize: fonts.sm, textAlign: isRTL ? 'right' : 'left' }]}>{m.body}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => dismiss(m)} style={styles.close} accessibilityLabel={t('close')}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    list: { paddingHorizontal: SPACING.md, marginTop: SPACING.md, gap: SPACING.sm },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderLeftWidth: 4,
    },
    body: { flex: 1 },
    title: { color: c.text, fontWeight: '700' },
    text: { color: c.text, marginTop: 2, lineHeight: 20 },
    close: { padding: 2 },
  });
