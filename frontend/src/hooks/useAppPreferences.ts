import { useEffect, useState } from "react";

import { AppLanguage, AppTheme } from "../utils/translations";

const LANGUAGE_KEY = "pawmedic-language";
const THEME_KEY = "pawmedic-theme";

export function useAppPreferences() {
  const [language, setLanguageState] = useState<AppLanguage>(() => (localStorage.getItem(LANGUAGE_KEY) as AppLanguage) || "en");
  const [theme, setThemeState] = useState<AppTheme>(() => (localStorage.getItem(THEME_KEY) as AppTheme) || "light");

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return {
    language,
    theme,
    setLanguage: setLanguageState,
    setTheme: setThemeState
  };
}
