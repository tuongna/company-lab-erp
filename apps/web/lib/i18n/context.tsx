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

const COOKIE_NAME = 'companylab_locale';
const STORAGE_KEY = 'companylab-locale';
export const DEFAULT_LOCALE: Locale = 'en';

function isValidLocale(val: unknown): val is Locale {
  return val === 'vi' || val === 'en' || val === 'ko';
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getUrlLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang') || params.get('locale');
    if (isValidLocale(lang)) {
      return lang;
    }
  } catch {
    // Ignore URL parsing errors
  }
  return null;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: en,
});

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  // Sync initial locale or detect from client sources if not provided via route param
  useEffect(() => {
    if (initialLocale && isValidLocale(initialLocale)) {
      setLocaleState(initialLocale);
      document.documentElement.lang = initialLocale;
      setCookie(COOKIE_NAME, initialLocale);
      try {
        localStorage.setItem(STORAGE_KEY, initialLocale);
      } catch {}
      return;
    }

    // Fallback detection if accessed outside dynamic [locale] segment:
    // 1. URL search param
    const urlLoc = getUrlLocale();
    if (urlLoc) {
      setLocaleState(urlLoc);
      document.documentElement.lang = urlLoc;
      setCookie(COOKIE_NAME, urlLoc);
      try {
        localStorage.setItem(STORAGE_KEY, urlLoc);
      } catch {}
      return;
    }

    // 2. Cookie
    const cookieLoc = getCookie(COOKIE_NAME);
    if (isValidLocale(cookieLoc)) {
      setLocaleState(cookieLoc);
      document.documentElement.lang = cookieLoc;
      try {
        localStorage.setItem(STORAGE_KEY, cookieLoc);
      } catch {}
      return;
    }

    // 3. LocalStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (isValidLocale(saved)) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
        setCookie(COOKIE_NAME, saved);
        return;
      }
    } catch {}

    // 4. Browser Language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.slice(0, 2);
      if (isValidLocale(browserLang)) {
        setLocaleState(browserLang);
        document.documentElement.lang = browserLang;
        setCookie(COOKIE_NAME, browserLang);
        try {
          localStorage.setItem(STORAGE_KEY, browserLang);
        } catch {}
        return;
      }
    }

    // 5. Default
    document.documentElement.lang = DEFAULT_LOCALE;
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    if (!isValidLocale(newLocale)) return;
    setLocaleState(newLocale);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }

    // Persist to Cookie for server-side compatibility
    setCookie(COOKIE_NAME, newLocale);

    // Persist to LocalStorage for offline/client fallback
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}

    // If URL uses sub-path /[locale]/..., switch path to new locale
    if (typeof window !== 'undefined') {
      try {
        const pathname = window.location.pathname;
        const segments = pathname.split('/');
        if (segments[1] && isValidLocale(segments[1])) {
          segments[1] = newLocale;
          const newPath = segments.join('/') + window.location.search;
          window.location.href = newPath;
          return;
        }

        // Fallback for query param
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLocale);
        window.history.replaceState(window.history.state, '', url.toString());
      } catch {}
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
