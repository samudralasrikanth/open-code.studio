import type { Theme } from "../domain/Theme.js";

export class ThemeSerializer {
  public serialize(theme: Theme): string {
    return JSON.stringify(theme, null, 2);
  }

  public deserialize(content: string): Theme {
    const raw = JSON.parse(content);
    if (!raw.id || !raw.name || !raw.colors) {
      throw new Error("Invalid theme payload: missing id, name, or colors.");
    }
    return raw as Theme;
  }
}
