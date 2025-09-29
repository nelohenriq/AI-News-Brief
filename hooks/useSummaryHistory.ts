import { useState, useCallback, useEffect } from 'react';
import { Summary } from '../types';

const SUMMARY_HISTORY_STORAGE_KEY = 'aiNewsBriefSummaryHistory';

export const useSummaryHistory = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    try {
      const storedSummaries = localStorage.getItem(SUMMARY_HISTORY_STORAGE_KEY);
      if (storedSummaries) {
        setSummaries(JSON.parse(storedSummaries));
      }
    } catch (error) {
      console.error("Failed to load summary history from localStorage:", error);
    }
  }, []);

  const saveSummaries = (newSummaries: Summary[]) => {
    try {
      // Sort by date descending before saving and setting state
      const sortedSummaries = newSummaries.sort((a, b) => 
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      localStorage.setItem(SUMMARY_HISTORY_STORAGE_KEY, JSON.stringify(sortedSummaries));
      setSummaries(sortedSummaries);
    } catch (error) {
      console.error("Failed to save summary history to localStorage:", error);
    }
  };

  const addSummaries = useCallback((newSummaries: Summary[]) => {
    // We create a new array to avoid mutation issues with state
    const updatedSummaries = [...summaries, ...newSummaries];
    saveSummaries(updatedSummaries);
  }, [summaries]);

  return { summaries, addSummaries };
};