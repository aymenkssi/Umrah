import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => Promise<void>;
  completedSteps: string[];
  toggleStepCompletion: (stepId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  detailedView: boolean;
  toggleView: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [detailedView, setDetailedView] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedFontSize, savedSteps, savedView] = await Promise.all([
        AsyncStorage.getItem('font_size'),
        AsyncStorage.getItem('completed_steps'),
        AsyncStorage.getItem('detailed_view'),
      ]);

      if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
        setFontSizeState(savedFontSize as FontSize);
      }

      if (savedSteps) {
        setCompletedSteps(JSON.parse(savedSteps));
      }

      if (savedView) {
        setDetailedView(savedView === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setFontSize = async (size: FontSize) => {
    try {
      await AsyncStorage.setItem('font_size', size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const toggleStepCompletion = async (stepId: string) => {
    try {
      const newCompletedSteps = completedSteps.includes(stepId)
        ? completedSteps.filter(id => id !== stepId)
        : [...completedSteps, stepId];
      
      await AsyncStorage.setItem('completed_steps', JSON.stringify(newCompletedSteps));
      setCompletedSteps(newCompletedSteps);
    } catch (error) {
      console.error('Error toggling step completion:', error);
    }
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.setItem('completed_steps', JSON.stringify([]));
      setCompletedSteps([]);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  const toggleView = () => {
    const newView = !detailedView;
    setDetailedView(newView);
    AsyncStorage.setItem('detailed_view', String(newView));
  };

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        completedSteps,
        toggleStepCompletion,
        resetProgress,
        detailedView,
        toggleView,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};