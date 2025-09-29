import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Settings, Provider } from '../types';

const SETTINGS_STORAGE_KEY = 'aiNewsBriefSettings';

const DEFAULT_SETTINGS: Settings = {
  provider: 'gemini',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: '',
  groqApiKey: '',
  groqModel: '',
};

interface SettingsContextType {
  settings: Settings;
  saveSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        // Combine defaults with stored settings to ensure all keys are present
        return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
    return DEFAULT_SETTINGS;
  });

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

  const contextValue = { settings, saveSettings };

  // FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
  // The original JSX was causing parsing errors because the file was not treated as a TSX file.
  return React.createElement(SettingsContext.Provider, { value: contextValue }, children);
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};