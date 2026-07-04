import { PlatformError } from "@ocs/common/errors";

import type { Theme } from "../domain/Theme.js";

const ONE_DARK_THEME: Theme = {
  id: "one-dark",
  name: "One Dark Pro",
  author: "OpenCodeStudio",
  version: "1.0.0",
  type: "dark",
  colors: {
    "background.primary": "#282c34",
    "background.secondary": "#21252b",
    "text.primary": "#abb2bf",
    "text.secondary": "#5c6370",
    "border.default": "#181a1f",
    "editor.background": "#282c34",
    "sidebar.background": "#21252b",
    "activityBar.background": "#21252b",
    "statusBar.background": "#21252b"
  },
  monaco: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "abb2bf" },
      { token: "comment", foreground: "5c6370", fontStyle: "italic" },
      { token: "keyword", foreground: "c678dd" },
      { token: "string", foreground: "98c379" },
      { token: "number", foreground: "d19a66" }
    ],
    colors: {
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf"
    }
  },
  terminal: {
    background: "#282c34",
    foreground: "#abb2bf",
    cursor: "#528bff",
    black: "#1e1e1e",
    red: "#e06c75",
    green: "#98c379",
    yellow: "#d19a66",
    blue: "#61afef",
    magenta: "#c678dd",
    cyan: "#56b6c2",
    white: "#abb2bf",
    brightBlack: "#5c6370",
    brightRed: "#e06c75",
    brightGreen: "#98c379",
    brightYellow: "#d19a66",
    brightBlue: "#61afef",
    brightMagenta: "#c678dd",
    brightCyan: "#56b6c2",
    brightWhite: "#ffffff"
  }
};

const LIGHT_MODERN_THEME: Theme = {
  id: "light-modern",
  name: "Light Modern",
  author: "OpenCodeStudio",
  version: "1.0.0",
  type: "light",
  colors: {
    "background.primary": "#f3f3f3",
    "background.secondary": "#e8e8e8",
    "text.primary": "#333333",
    "text.secondary": "#6a737d",
    "border.default": "#d1d5da",
    "editor.background": "#ffffff",
    "sidebar.background": "#f6f8fa",
    "activityBar.background": "#24292e",
    "statusBar.background": "#007acc"
  },
  monaco: {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: "333333" },
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "keyword", foreground: "d73a49" },
      { token: "string", foreground: "032f62" },
      { token: "number", foreground: "005cc5" }
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#333333"
    }
  },
  terminal: {
    background: "#f3f3f3",
    foreground: "#333333",
    cursor: "#007acc",
    black: "#000000",
    red: "#d73a49",
    green: "#22863a",
    yellow: "#b08800",
    blue: "#005cc5",
    magenta: "#6f42c1",
    cyan: "#005cc5",
    white: "#6a737d",
    brightBlack: "#959da5",
    brightRed: "#cb2431",
    brightGreen: "#28a745",
    brightYellow: "#f9c513",
    brightBlue: "#0366d6",
    brightMagenta: "#8a63d2",
    brightCyan: "#05a5e3",
    brightWhite: "#d1d5da"
  }
};

const HIGH_CONTRAST_THEME: Theme = {
  id: "high-contrast",
  name: "High Contrast Black",
  author: "OpenCodeStudio",
  version: "1.0.0",
  type: "hc",
  colors: {
    "background.primary": "#000000",
    "background.secondary": "#000000",
    "text.primary": "#ffffff",
    "text.secondary": "#00ff00",
    "border.default": "#ffffff",
    "editor.background": "#000000",
    "sidebar.background": "#000000",
    "activityBar.background": "#000000",
    "statusBar.background": "#000000"
  },
  monaco: {
    base: "hc-black",
    inherit: true,
    rules: [
      { token: "", foreground: "ffffff" },
      { token: "comment", foreground: "00ff00", fontStyle: "italic" },
      { token: "keyword", foreground: "ffff00" },
      { token: "string", foreground: "00ffff" },
      { token: "number", foreground: "ff00ff" }
    ],
    colors: {
      "editor.background": "#000000",
      "editor.foreground": "#ffffff"
    }
  },
  terminal: {
    background: "#000000",
    foreground: "#ffffff",
    cursor: "#00ff00",
    black: "#000000",
    red: "#ff0000",
    green: "#00ff00",
    yellow: "#ffff00",
    blue: "#0000ff",
    magenta: "#ff00ff",
    cyan: "#00ffff",
    white: "#ffffff",
    brightBlack: "#555555",
    brightRed: "#ff5555",
    brightGreen: "#55ff55",
    brightYellow: "#ffff55",
    brightBlue: "#5555ff",
    brightMagenta: "#ff55ff",
    brightCyan: "#55ffff",
    brightWhite: "#ffffff"
  }
};

const AETHER_OS_THEME: Theme = {
  id: "aether-os",
  name: "AetherOS",
  author: "OpenCodeStudio",
  version: "1.0.0",
  type: "dark",
  colors: {
    "background.primary": "#0B0F17",
    "background.secondary": "#0f131c",
    "background.tertiary": "#181c24",
    "background.hover": "#262a33",
    "background.active": "#31353e",
    "text.primary": "#dfe2ee",
    "text.secondary": "#c2c6d7",
    "text.muted": "#94A3B8",
    "border.default": "rgba(255, 255, 255, 0.08)",
    "border.strong": "#424654",
    "accent.primary": "#2E7BFF",
    "accent.hover": "#1d66e5",
    "accent.muted": "rgba(46, 123, 255, 0.15)",
    "editor.background": "#0B0F17",
    "sidebar.background": "#0f131c",
    "activityBar.background": "#0a0e16",
    "statusBar.background": "#1c2028"
  },
  monaco: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "dfe2ee" },
      { token: "comment", foreground: "94A3B8", fontStyle: "italic" },
      { token: "keyword", foreground: "A855F7" },
      { token: "string", foreground: "4edea3" },
      { token: "number", foreground: "2E7BFF" }
    ],
    colors: {
      "editor.background": "#0B0F17",
      "editor.foreground": "#dfe2ee"
    }
  },
  terminal: {
    background: "#0B0F17",
    foreground: "#dfe2ee",
    cursor: "#2E7BFF",
    black: "#0a0e16",
    red: "#ffb4ab",
    green: "#4edea3",
    yellow: "#c2c6d7",
    blue: "#2E7BFF",
    magenta: "#A855F7",
    cyan: "#4edea3",
    white: "#dfe2ee",
    brightBlack: "#353942",
    brightRed: "#ffb4ab",
    brightGreen: "#4edea3",
    brightYellow: "#c2c6d7",
    brightBlue: "#2E7BFF",
    brightMagenta: "#A855F7",
    brightCyan: "#4edea3",
    brightWhite: "#ffffff"
  }
};

export class ThemeRegistry {
  private readonly themes = new Map<string, Theme>();

  constructor() {
    // Register built-in themes
    this.register(ONE_DARK_THEME);
    this.register(LIGHT_MODERN_THEME);
    this.register(HIGH_CONTRAST_THEME);
    this.register(AETHER_OS_THEME);
  }

  public register(theme: Theme): void {
    if (this.themes.has(theme.id)) {
      throw new PlatformError({
        category: "configuration",
        code: "OCS-THEME-DUPLICATE",
        message: `Theme with ID '${theme.id}' is already registered.`
      });
    }
    this.themes.set(theme.id, theme);
  }

  public get(id: string): Theme | undefined {
    return this.themes.get(id);
  }

  public getAll(): Theme[] {
    return Array.from(this.themes.values());
  }
}
