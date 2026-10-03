'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Mode = 'dark' | 'light';
type Theme = 'blue' | 'green' | 'purple';
type TextSize = 'small' | 'medium' | 'large';

interface ThemePrefs {
  mode: Mode;
  theme: Theme;
  brightness: number;
  textSize: TextSize;
}

interface ThemeContextType extends ThemePrefs {
  setMode: (m: Mode) => void;
  setTheme: (t: Theme) => void;
  setBrightness: (b: number) => void;
  setTextSize: (s: TextSize) => void;
  toggleMode: () => void;
}

const defaults: ThemePrefs = {
  mode: 'dark',
  theme: 'blue',
  brightness: 100,
  textSize: 'medium',
};

const ThemeContext = createContext<ThemeContextType>({
  ...defaults,
  setMode: () => {},
  setTheme: () => {},
  setBrightness: () => {},
  setTextSize: () => {},
  toggleMode: () => {},
});

const STORAGE_KEY = 'technotes-theme';

function textSizeToPx(s: TextSize): number {
  if (s === 'small') return 14;
  if (s === 'large') return 18;
  return 16;
}

function applyPrefs(prefs: ThemePrefs) {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(prefs.mode);
  root.setAttribute('data-theme', prefs.theme);
  root.style.filter = `brightness(${prefs.brightness}%)`;
  root.style.fontSize = `${textSizeToPx(prefs.textSize)}px`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(defaults);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: ThemePrefs | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // ignore
    }
    const merged = stored ? { ...defaults, ...stored } : defaults;
    setPrefs(merged);
    applyPrefs(merged);
    setMounted(true);
  }, []);

  const update = useCallback((patch: Partial<ThemePrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setMode = useCallback((mode: Mode) => update({ mode }), [update]);
  const setTheme = useCallback((theme: Theme) => update({ theme }), [update]);
  const setBrightness = useCallback((brightness: number) => update({ brightness }), [update]);
  const setTextSize = useCallback((textSize: TextSize) => update({ textSize }), [update]);
  const toggleMode = useCallback(() => {
    setPrefs((prev) => {
      const mode: Mode = prev.mode === 'dark' ? 'light' : 'dark';
      const next = { ...prev, mode };
      applyPrefs(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        ...prefs,
        setMode,
        setTheme,
        setBrightness,
        setTextSize,
        toggleMode,
      }}
    >
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
