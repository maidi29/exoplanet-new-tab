import { useState, useEffect } from 'react';

/**
 * A React hook that provides persistent state using Chrome extension storage.
 * This is more reliable than localStorage for browser extensions and provides
 * better isolation and performance.
 * 
 * @param key - The storage key
 * @param defaultValue - The default value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 */
export const usePersistentState = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = () => {
      try {
        chrome.storage.local.get(key, (result) => {
          if (result[key] !== undefined) {
            setValue(result[key] as T);
          }
          setIsLoaded(true);
        });
      } catch (error) {
        console.warn(`Failed to load persistent state for key "${key}":`, error);
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage whenever it changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save until we've loaded the initial value

    const saveValue = async () => {
      try {
        await chrome.storage.local.set({ [key]: value });
      } catch (error) {
        console.warn(`Failed to save persistent state for key "${key}":`, error);
      }
    };

    saveValue();
  }, [key, value, isLoaded]);

  return [value, setValue] as const;
};
