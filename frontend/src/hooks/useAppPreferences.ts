import { useEffect, useState } from "react";

import i18n, { AppLanguage, AppTheme } from "../lib/i18n";

const LANGUAGE_KEY = "petmedico-language";
const THEME_KEY = "petmedico-theme";

export function useAppPreferences() {
  const [language, setLanguageState] = useState<AppLanguage>(() => (localStorage.getItem(LANGUAGE_KEY) as AppLanguage) || "en");
  const [theme, setThemeState] = useState<AppTheme>(() => (localStorage.getItem(THEME_KEY) as AppTheme) || "light");

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    void i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return {
    language,
    theme,
    setLanguage: setLanguageState,
    setTheme: setThemeState
  };
}
