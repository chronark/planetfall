import { useEffect, useState } from "react";

export const useSessionStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    // Retrieve from sessionStorage
    const item = window.sessionStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue = (value: any) => {
    // Save state
    setStoredValue(value);
    // Save to sessionStorage
    window.sessionStorage.setItem(key, JSON.stringify(value));
  };
  return [storedValue, setValue];
};
