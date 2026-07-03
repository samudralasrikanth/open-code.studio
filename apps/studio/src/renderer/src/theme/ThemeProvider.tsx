import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { usePlatform } from "../hooks/usePlatform.js";

export type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const { getTheme, setTheme: setPlatformTheme } = usePlatform();

  // Load persisted theme on mount
  useEffect(() => {
    getTheme()
      .then((persisted) => {
        applyTheme(persisted);
        setThemeState(persisted);
      })
      .catch(() => {
        applyTheme("dark");
      });

    // Listen for OS theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (): void => {
      if (theme === "system") {
        const resolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(resolved);
        document.documentElement.setAttribute("data-theme", resolved);
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme, getTheme]);

  const setTheme = useCallback(
    async (newTheme: Theme): Promise<void> => {
      await setPlatformTheme(newTheme);
      applyTheme(newTheme);
      setThemeState(newTheme);
    },
    [setPlatformTheme]
  );

  function applyTheme(t: Theme): void {
    const isDark =
      t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const resolved: "dark" | "light" = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", resolved);
    setResolvedTheme(resolved);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
