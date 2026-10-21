import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "crm-theme";

/* Each theme's CSS variables live in theme.css under a matching
   [data-theme="..."] selector. This list only drives the switcher UI —
   add a new palette here AND in theme.css to introduce a 5th theme. */
export const THEMES = [
  { code: "light",  label: "Daylight",  icon: "☀️" },
  { code: "dark",   label: "Midnight",  icon: "🌙" },
  { code: "forest", label: "Forest",    icon: "🌿" },
  { code: "sunset", label: "Sunset",    icon: "🌇" },
];

const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && THEMES.some(t => t.code === stored) ? stored : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  // Reflect the active theme onto <html data-theme="..."> so theme.css's
  // attribute-selector overrides apply everywhere, including portals.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((code) => {
    if (!THEMES.some(t => t.code === code)) return;
    setThemeState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable — theme just won't persist across reloads.
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return ctx;
}
