import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SPACING, Palette } from '../constants/theme';
import { IslamicPattern } from '../components/IslamicPattern';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';

export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  useEffect(() => {
    // Short branded splash, then go to the home tab
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.patternContainer}>
        <IslamicPattern width={300} height={300} opacity={0.1} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.arabicTitle}>رفيق العمرة والحج</Text>
        <Text style={styles.englishTitle}>Umrah & Hajj Companion</Text>
        <Text style={styles.frenchTitle}>Compagnon de la Omra et du Hajj</Text>
        
        <ActivityIndicator
          size="large"
          color={colors.gold}
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternContainer: {
    position: 'absolute',
    opacity: 0.3,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  arabicTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: c.textLight,
    marginBottom: SPACING.sm,
  },
  englishTitle: {
    fontSize: 24,
    color: c.gold,
    marginBottom: SPACING.xs,
  },
  frenchTitle: {
    fontSize: 18,
    color: c.onPrimaryMuted,
    marginBottom: SPACING.xl,
  },
  loader: {
    marginTop: SPACING.xl,
  },
});