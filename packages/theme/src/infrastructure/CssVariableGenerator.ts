import type { Theme } from "../domain/Theme.js";

export class CssVariableGenerator {
  private styleElement: HTMLStyleElement | null = null;

  public generateAndInject(theme: Theme): void {
    if (typeof document === "undefined") {
      return; // No DOM available (e.g. Node tests/main process)
    }

    let style = this.styleElement;
    if (!style) {
      style = document.createElement("style");
      style.id = "ocs-theme-variables";
      document.head.appendChild(style);
      this.styleElement = style;
    }

    const variables = Object.entries(theme.colors)
      .map(([token, value]) => {
        // Convert background.primary -> --background-primary
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
}
