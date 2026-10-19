'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Translations, SUPPORTED_LOCALES } from './types';
import { vi } from './dictionaries/vi';
import { en } from './dictionaries/en';
import { ko } from './dictionaries/ko';

const dictionaries: Record<Locale, Translations> = {
  vi,
  en,
  ko,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'vi',
  setLocale: () => {},
  t: vi,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('companylab-locale') as Locale | null;
      if (saved && (saved === 'vi' || saved === 'en' || saved === 'ko')) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      } else {
        const browserLang = navigator.language.slice(0, 2);
        if (browserLang === 'ko' || browserLang === 'en') {
          setLocaleState(browserLang as Locale);
          document.documentElement.lang = browserLang;
        } else {
          document.documentElement.lang = 'vi';
        }
      }
    } catch {
      // Fallback silently if localStorage is restricted
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('companylab-locale', newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore storage errors
    }
  };

  const t = dictionaries[locale] || vi;

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
