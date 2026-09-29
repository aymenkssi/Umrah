import React from 'react';
import { Stack, ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../contexts/LanguageContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { AdsProvider } from '../contexts/AdsContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { AudioProvider } from '../contexts/AudioContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function ThemedStack() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  // Navigation containers use the palette too, so no white flash between screens in dark mode.
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="counter" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="checklist" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="places" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <NotificationsProvider>
              <AdsProvider>
                <AudioProvider>
                  <ThemedStack />
                </AudioProvider>
              </AdsProvider>
            </NotificationsProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
