import type { Theme } from "../domain/Theme.js";

export class MonacoThemeAdapter {
  public registerAndApply(theme: Theme, monacoInstance?: any): void {
    const monaco =
      monacoInstance || (typeof window !== "undefined" ? (window as any).monaco : undefined);
    if (!monaco) {
      return; // Monaco not loaded yet or not in renderer
    }

    const themeId = `ocs-theme-${theme.id}`;

    // Define custom Monaco theme mapped to design tokens
    monaco.editor.defineTheme(themeId, {
      base: theme.monaco.base,
      inherit: theme.monaco.inherit,
      rules: theme.monaco.rules,
      colors: {
        ...theme.monaco.colors,
        "editor.background":
          theme.colors["editor.background"] || theme.colors["background.primary"],
        "editor.foreground": theme.colors["text.primary"]
      }
    });

    // Apply the theme
    monaco.editor.setTheme(themeId);
  }
}
