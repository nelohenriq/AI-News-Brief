import { useState, useCallback, useEffect } from 'react';

const ARTICLE_HISTORY_STORAGE_KEY = 'aiNewsBriefArticleHistory';

export const useArticleHistory = () => {
  const [processedLinks, setProcessedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(ARTICLE_HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setProcessedLinks(new Set(JSON.parse(storedHistory)));
      }
    } catch (error) {
      console.error("Failed to load article history from localStorage:", error);
    }
  }, []);

  const saveHistory = (newHistory: Set<string>) => {
    try {
      localStorage.setItem(ARTICLE_HISTORY_STORAGE_KEY, JSON.stringify(Array.from(newHistory)));
      setProcessedLinks(newHistory);
    } catch (error) {
      console.error("Failed to save article history to localStorage:", error);
    }
  };

  const addArticles = useCallback((links: string[]) => {
    setProcessedLinks(prevHistory => {
      const newHistory = new Set(prevHistory);
      links.forEach(link => newHistory.add(link));
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);
  
  const hasArticle = useCallback((link: string) => {
    return processedLinks.has(link);
  }, [processedLinks]);


  return { hasArticle, addArticles };
};