import { useCallback, useEffect, useState } from 'react';

// Dark mode via class `dark` di <html>. Disimpan di localStorage terpisah
// (preferensi UI, bukan data domain — boleh akses langsung).
const KEY = 'habittracker.v1.theme';

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    try {
      window.localStorage.setItem(KEY, dark ? 'dark' : 'light');
    } catch {
      // abaikan
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}
