import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { DEFAULT_LANGUAGE } from "./languages";
import { translations } from "./translations";

const STORAGE_KEY = "crm-language";

const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && translations[stored] ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  const setLanguage = useCallback((code) => {
    if (!translations[code]) return;
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable — language just won't persist across reloads.
    }
  }, []);

  // t("dashboard.quickActions") -> walks translations[language].dashboard.quickActions,
  // falling back to the English string, then to the key itself, so a missing
  // translation shows readable text instead of "undefined".
  const t = useCallback((key) => {
    const dict = translations[language] || translations[DEFAULT_LANGUAGE];
    const fallback = translations[DEFAULT_LANGUAGE];
    const parts = key.split(".");

    let node = dict;
    for (const part of parts) node = node?.[part];
    if (node !== undefined) return node;

    let fallbackNode = fallback;
    for (const part of parts) fallbackNode = fallbackNode?.[part];
    if (fallbackNode !== undefined) return fallbackNode;

    return key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside a <LanguageProvider>");
  return ctx;
}
