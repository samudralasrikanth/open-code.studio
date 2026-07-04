export type ThemeType = "light" | "dark" | "hc";

export interface ColorTokens {
  readonly "background.primary": string;
  readonly "background.secondary": string;
  readonly "text.primary": string;
  readonly "text.secondary": string;
  readonly "border.default": string;
  readonly "editor.background": string;
  readonly "sidebar.background": string;
  readonly "activityBar.background": string;
  readonly "statusBar.background": string;
  readonly [token: string]: string; // Support other arbitary tokens
}

export interface MonacoThemeRule {
  readonly token: string;
  readonly foreground?: string;
  readonly background?: string;
  readonly fontStyle?: string;
}

export interface MonacoThemeConfig {
  readonly base: "vs" | "vs-dark" | "hc-black";
  readonly inherit: boolean;
  readonly rules: MonacoThemeRule[];
  readonly colors: Record<string, string>;
}

export interface TerminalThemeConfig {
  readonly background: string;
  readonly foreground: string;
  readonly cursor: string;
  readonly black: string;
  readonly red: string;
  readonly green: string;
  readonly yellow: string;
  readonly blue: string;
  readonly magenta: string;
  readonly cyan: string;
  readonly white: string;
  readonly brightBlack: string;
  readonly brightRed: string;
  readonly brightGreen: string;
  readonly brightYellow: string;
  readonly brightBlue: string;
  readonly brightMagenta: string;
  readonly brightCyan: string;
  readonly brightWhite: string;
}

export interface Theme {
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly version: string;
  readonly type: ThemeType;
  readonly colors: ColorTokens;
  readonly monaco: MonacoThemeConfig;
  readonly terminal: TerminalThemeConfig;
}
