import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'small' | 'medium' | 'large';

const FONT_SIZE_VALUES: FontSize[] = ['small', 'medium', 'large'];

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

const parseSteps = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const persist = (key: string, value: string) =>
  AsyncStorage.setItem(key, value).catch((error) =>
    console.error(`Error saving ${key}:`, error)
  );

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [detailedView, setDetailedView] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('font_size'),
      AsyncStorage.getItem('completed_steps'),
      AsyncStorage.getItem('detailed_view'),
    ])
      .then(([savedFontSize, savedSteps, savedView]) => {
        if (savedFontSize && (FONT_SIZE_VALUES as string[]).includes(savedFontSize)) {
          setFontSizeState(savedFontSize as FontSize);
        }
        setCompletedSteps(parseSteps(savedSteps));
        if (savedView) {
          setDetailedView(savedView === 'true');
        }
      })
      .catch((error) => console.error('Error loading settings:', error))
      .finally(() => setLoaded(true));
  }, []);

  const setFontSize = useCallback(async (size: FontSize) => {
    setFontSizeState(size);
    await persist('font_size', size);
  }, []);

  // Functional updates so that quick successive taps never work on stale state.
  const toggleStepCompletion = useCallback(async (stepId: string) => {
    setCompletedSteps((current) =>
      current.includes(stepId) ? current.filter((id) => id !== stepId) : [...current, stepId]
    );
  }, []);

  const resetProgress = useCallback(async () => {
    setCompletedSteps([]);
  }, []);

  const toggleView = useCallback(() => {
    setDetailedView((current) => !current);
  }, []);

  // Persist progress and view mode once the saved values have been loaded,
  // so the initial defaults never overwrite what is stored on the device.
  useEffect(() => {
    if (loaded) persist('completed_steps', JSON.stringify(completedSteps));
  }, [loaded, completedSteps]);

  useEffect(() => {
    if (loaded) persist('detailed_view', String(detailedView));
  }, [loaded, detailedView]);

  const value = useMemo(
    () => ({
      fontSize,
      setFontSize,
      completedSteps,
      toggleStepCompletion,
      resetProgress,
      detailedView,
      toggleView,
    }),
    [fontSize, setFontSize, completedSteps, toggleStepCompletion, resetProgress, detailedView, toggleView]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
