import { useState, useCallback, useEffect } from 'react';
import { Source } from '../types';

const SOURCES_STORAGE_KEY = 'aiNewsBriefSources';

const DEFAULT_SOURCES: Source[] = [];

export const useNewsSources = () => {
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    try {
      const storedSources = localStorage.getItem(SOURCES_STORAGE_KEY);
      if (storedSources) {
        setSources(JSON.parse(storedSources));
      } else {
        setSources(DEFAULT_SOURCES);
      }
    } catch (error) {
      console.error("Failed to load news sources from localStorage:", error);
      setSources(DEFAULT_SOURCES);
    }
  }, []);

  const saveSources = (newSources: Source[]) => {
    try {
      localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(newSources));
      setSources(newSources);
    } catch (error) {
      console.error("Failed to save news sources to localStorage:", error);
    }
  };

  const addSource = useCallback((name: string, url: string) => {
    const newSource: Source = {
      id: Date.now().toString(),
      name,
      url,
    };
    saveSources([...sources, newSource]);
  }, [sources]);

  const removeSource = useCallback((id: string) => {
    const updatedSources = sources.filter(source => source.id !== id);
    saveSources(updatedSources);
  }, [sources]);

  const updateSource = useCallback((id: string, name: string, url: string) => {
    const updatedSources = sources.map(source => 
      source.id === id ? { ...source, name, url } : source
    );
    saveSources(updatedSources);
  }, [sources]);

  return { sources, addSource, removeSource, updateSource };
};