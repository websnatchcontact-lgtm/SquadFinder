import { useCallback, useEffect, useState } from 'react';

/** Generic Local Storage-backed state hook, mirroring useState's API. */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(next));
          window.dispatchEvent(new Event('squadfinder-storage-changed'));
        }
        return next;
      });
    },
    [key],
  );


  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = window.localStorage.getItem(key);
        setStoredValue(raw ? (JSON.parse(raw) as T) : initialValue);
      } catch {
        setStoredValue(initialValue);
      }
    };
    window.addEventListener('squadfinder-storage-changed', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('squadfinder-storage-changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}
