import React, { createContext, useState, useContext, useEffect } from 'react';
import { TRANSLATIONS, LANGUAGES } from './translations';
import { getStoredLanguage, setStoredLanguage } from '../utils/storage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const stored = await getStoredLanguage();
    if (stored && TRANSLATIONS[stored]) {
      setLanguage(stored);
    }
  };

  const changeLanguage = async (code) => {
    if (TRANSLATIONS[code]) {
      setLanguage(code);
      await setStoredLanguage(code);
    }
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
