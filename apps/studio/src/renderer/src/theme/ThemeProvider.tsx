import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { usePlatform } from "../hooks/usePlatform.js";

export type Theme = string;

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function injectThemeCss(colors: Record<string, string>): void {
  let style = document.getElementById("ocs-theme-variables");
  if (!style) {
    style = document.createElement("style");
    style.id = "ocs-theme-variables";
    document.head.appendChild(style);
  }
  const variables = Object.entries(colors)
    .map(([token, value]) => {
      const cssName = `--${token.replace(/\./g, "-")}`;
      return `  ${cssName}: ${value};`;
    })
    .join("\n");
  style.innerHTML = `
:root {
${variables}
}
`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [theme, setThemeState] = useState<Theme>("one-dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const { setTheme: setPlatformTheme } = usePlatform();

  // Load persisted theme on mount and listen for IPC push notifications
  useEffect(() => {
    const initTheme = async (): Promise<void> => {
      try {
        const res = await window.ocs.theme.get();
        if (res && typeof res === "object") {
          const { activeId, theme: themeObj } = res;
          if (themeObj && themeObj.colors) {
            injectThemeCss(themeObj.colors);
          }
          const resolvedMode = themeObj?.type === "light" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", resolvedMode);
          setThemeState(activeId || "one-dark");
          setResolvedTheme(resolvedMode);
        }
      } catch (err) {
        console.error("Failed to load active theme in renderer:", err);
      }
    };

    void initTheme();

    if (window.ocs.theme.onChange) {
      const cleanup = window.ocs.theme.onChange((data) => {
        void (async () => {
          const themeId = data?.themeId;
          if (themeId) {
            try {
              const res = await window.ocs.theme.get();
              if (res && typeof res === "object") {
                const { theme: themeObj } = res;
                if (themeObj && themeObj.colors) {
                  injectThemeCss(themeObj.colors);
                }
                const resolvedMode = themeObj?.type === "light" ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", resolvedMode);
                setThemeState(themeId);
                setResolvedTheme(resolvedMode);
              }
            } catch (err) {
              console.error("Failed to update active theme in renderer:", err);
            }
          }
        })();
      });
      return cleanup;
    }
    return undefined;
  }, []);

  const setTheme = useCallback(
    async (newTheme: Theme): Promise<void> => {
      await setPlatformTheme(newTheme);
      try {
        const res = await window.ocs.theme.get();
        if (res && typeof res === "object") {
          const { theme: themeObj } = res;
          if (themeObj && themeObj.colors) {
            injectThemeCss(themeObj.colors);
          }
          const resolvedMode = themeObj?.type === "light" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", resolvedMode);
          setThemeState(newTheme);
          setResolvedTheme(resolvedMode);
        }
      } catch (err) {
        console.error("Failed to get updated theme in renderer:", err);
      }
    },
    [setPlatformTheme]
  );

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
