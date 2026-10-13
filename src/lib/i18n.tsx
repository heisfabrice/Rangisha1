import React, { createContext, useContext, useState, useEffect } from 'react';
import rwJson from '../locales/rw.json';
import enJson from '../locales/en.json';

export type Language = 'rw' | 'en';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const translations = {
  rw: rwJson,
  en: enJson
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = (localStorage.getItem('rangisha_lang') || localStorage.getItem('ranga_lang')) as Language;
    return saved === 'en' || saved === 'rw' ? saved : 'rw'; // default to Kinyarwanda as per brief
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rangisha_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English
        let enCurrent: any = translations.en;
        for (const ek of keys) {
          if (enCurrent && typeof enCurrent === 'object' && ek in enCurrent) {
            enCurrent = enCurrent[ek];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : (fallback || keyPath);
      }
    }
    return typeof current === 'string' ? current : (fallback || keyPath);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
