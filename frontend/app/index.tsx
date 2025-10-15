import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../constants/theme';
import { IslamicPattern } from '../components/IslamicPattern';

export default function SplashScreen() {
  useEffect(() => {
    // Navigate to home after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.patternContainer}>
        <IslamicPattern width={300} height={300} opacity={0.1} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.arabicTitle}>رفيق العمرة</Text>
        <Text style={styles.englishTitle}>Umrah Companion</Text>
        <Text style={styles.frenchTitle}>Compagnon de la 'Omra</Text>
        
        <ActivityIndicator
          size="large"
          color={COLORS.gold}
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
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
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  englishTitle: {
    fontSize: 24,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  frenchTitle: {
    fontSize: 18,
    color: COLORS.goldLight,
    marginBottom: SPACING.xl,
  },
  loader: {
    marginTop: SPACING.xl,
  },
});