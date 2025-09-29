import { useState, useCallback, useEffect } from 'react';
import { UserInterests, Interest } from '../types';

const INTERESTS_STORAGE_KEY = 'aiNewsBriefInterests';
const RECENCY_BOOST = 5; // Score added on new interaction
const MANUAL_ADJUSTMENT = 2; // Score added/removed on manual adjustment
const HALF_LIFE_DAYS = 14; // Interests' score halves every 14 days
const DECAY_RATE = Math.log(2) / (HALF_LIFE_DAYS * 24 * 60 * 60 * 1000);

export const useUserInterests = () => {
  const [interests, setInterests] = useState<UserInterests>({});

  useEffect(() => {
    try {
      const storedInterests = localStorage.getItem(INTERESTS_STORAGE_KEY);
      if (storedInterests) {
        setInterests(JSON.parse(storedInterests));
      }
    } catch (error) {
      console.error("Failed to load user interests from localStorage:", error);
    }
  }, []);
  
  const saveInterests = (newInterests: UserInterests) => {
      try {
        localStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(newInterests));
      } catch (error) {
        console.error("Failed to save user interests to localStorage:", error);
      }
      setInterests(newInterests);
  };

  const addInterest = useCallback((tag: string) => {
    setInterests(prevInterests => {
      const now = Date.now();
      const existingInterest = prevInterests[tag];
      
      const newInterest: Interest = {
        score: (existingInterest?.score || 0) + RECENCY_BOOST,
        lastInteraction: now,
      };

      const newInterests = {
        ...prevInterests,
        [tag]: newInterest,
      };

      saveInterests(newInterests);
      return newInterests;
    });
  }, []);
  
  const adjustInterest = useCallback((tag: string, delta: number) => {
    setInterests(prevInterests => {
        const now = Date.now();
        const existingInterest = prevInterests[tag];
        if (!existingInterest) return prevInterests;

        const newScore = Math.max(0, existingInterest.score + (delta * MANUAL_ADJUSTMENT));
        
        const newInterests = {
            ...prevInterests,
            [tag]: { score: newScore, lastInteraction: now },
        };
        
        saveInterests(newInterests);
        return newInterests;
    });
  }, []);

  const removeInterest = useCallback((tag: string) => {
    setInterests(prevInterests => {
        const newInterests = { ...prevInterests };
        delete newInterests[tag];
        saveInterests(newInterests);
        return newInterests;
    });
  }, []);

  const getDecayedInterests = useCallback(() => {
    const now = Date.now();
    const decayedInterests: { [tag: string]: number } = {};

    for (const tag in interests) {
      const interest = interests[tag];
      const timeElapsed = now - interest.lastInteraction;
      const decayedScore = interest.score * Math.exp(-DECAY_RATE * timeElapsed);

      // Prune interests with negligible scores
      if (decayedScore > 0.1) {
        decayedInterests[tag] = decayedScore;
      }
    }
    return decayedInterests;
  }, [interests]);

  return { interests, addInterest, getDecayedInterests, adjustInterest, removeInterest };
};