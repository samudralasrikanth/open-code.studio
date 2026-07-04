import type { EventBus } from "@ocs/common";
import { ThemeEventTypes } from "@ocs/common/events";

import type { Theme } from "../domain/Theme.js";
import type { CssVariableGenerator } from "../infrastructure/CssVariableGenerator.js";
import type { MonacoThemeAdapter } from "../infrastructure/MonacoThemeAdapter.js";

import type { ThemeRegistry } from "./ThemeRegistry.js";

export class ThemeManager {
  private currentThemeId = "aether-os";

  constructor(
    private readonly registry: ThemeRegistry,
    private readonly cssGenerator: CssVariableGenerator,
    private readonly monacoAdapter: MonacoThemeAdapter,
    private readonly eventBus: EventBus
  ) {}

  public getActiveTheme(): Theme {
    const theme = this.registry.get(this.currentThemeId);
    if (!theme) {
      // Fallback to built-in one-dark
      return this.registry.get("one-dark")!;
    }
    return theme;
  }

  public applyTheme(themeId: string, monacoInstance?: unknown): void {
    const theme = this.registry.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found in registry.`);
    }

    this.currentThemeId = themeId;

    // Apply CSS variables and Monaco adaptations
    this.cssGenerator.generateAndInject(theme);
    this.monacoAdapter.registerAndApply(theme, monacoInstance);

    // Publish event
    void this.eventBus.publish(ThemeEventTypes.THEME_CHANGED, { themeId });
  }
}
