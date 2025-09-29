import { useState, useEffect } from 'react';
import { Settings, Provider } from '../types';

const SETTINGS_STORAGE_KEY = 'aiNewsBriefSettings';

const DEFAULT_SETTINGS: Settings = {
  provider: 'gemini',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: '',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const saveSettings = (newSettings: Partial<Settings>) => {
    try {
      setSettings(prevSettings => {
        const updatedSettings = { ...prevSettings, ...newSettings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
        return updatedSettings;
      });
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  return { settings, saveSettings };
};
