'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type Lang = 'en' | 'hi';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((en: string, hi: string) => (lang === 'hi' ? hi : en), [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
