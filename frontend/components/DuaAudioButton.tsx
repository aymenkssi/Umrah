import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDuaAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING } from '../constants/theme';

/** Play / stop button for a du'a recording; renders nothing when no recording exists. */
export const DuaAudioButton: React.FC<{ audioKey: string; compact?: boolean }> = ({ audioKey, compact }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { has, playingKey, loadingKey, failedKey, toggle } = useDuaAudio();
  if (!has(audioKey)) return null;

  const playing = playingKey === audioKey;
  const loading = loadingKey === audioKey;
  const failed = failedKey === audioKey;
  const label = playing ? t('pause') : t('audio_dua');

  return (
    <TouchableOpacity
      onPress={() => toggle(audioKey)}
      style={[styles.button, { backgroundColor: playing ? colors.gold : colors.primary }, compact && styles.compact]}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textLight} />
      ) : (
        <Ionicons
          name={failed ? 'alert-circle' : playing ? 'stop' : 'play'}
          size={compact ? 16 : 18}
          color={playing ? colors.onGold : colors.textLight}
        />
      )}
      {!compact && (
        <Text style={[styles.text, { color: playing ? colors.onGold : colors.textLight }]}>
          {failed ? t('try_again') : label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  compact: { paddingHorizontal: 10, paddingVertical: 8 },
  text: { fontWeight: '700', fontSize: 14 },
});
