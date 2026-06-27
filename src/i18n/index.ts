// src/i18n/index.ts — lightweight i18n with LanguageContext
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ar } from './ar';
import { fr } from './fr';

export type Language = 'ar' | 'fr';

const DICTIONARIES: Record<Language, Record<string, string>> = { ar, fr };

const LANG_KEY = 'SETTINGS_LANGUAGE';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'ar',
  setLanguage: async () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>('ar');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored === 'ar' || stored === 'fr') setLang(stored);
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLang(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  };

  const t = (key: string): string =>
    DICTIONARIES[language][key] ?? DICTIONARIES['ar'][key] ?? key;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Hook — use anywhere: const { t, language, setLanguage } = useTranslation(); */
export function useTranslation() {
  return useContext(I18nContext);
}
