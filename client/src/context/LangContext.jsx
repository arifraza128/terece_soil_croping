import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const t = key => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  };

  const changeLang = code => {
    localStorage.setItem('lang', code);
    setLang(code);
  };

  return <LangContext.Provider value={{ lang, t, changeLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
