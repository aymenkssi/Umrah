import React, { useEffect, useRef } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { startSession, trackScreen } from '../../utils/analytics';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const sessionStarted = useRef(false);

  // One anonymous session per launch (the splash screen gives the saved language time to load).
  useEffect(() => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    startSession(language);
  }, [language]);

  useEffect(() => {
    const screen = pathname.replace(/^\//, '');
    if (screen) trackScreen(screen);
  }, [pathname]);

  // Keep the tab bar above the Android navigation bar / iOS home indicator.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: t('tab_guide'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="miqat"
        options={{
          title: t('miqat'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer-times"
        options={{
          title: t('tab_prayers'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: t('qibla'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="duas"
        options={{
          title: t('tab_duas'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}