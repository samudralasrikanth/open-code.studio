import type { EventBus } from "@ocs/common";
import { ThemeEventTypes } from "@ocs/common/events";
import type { Theme } from "../domain/Theme.js";
import type { ThemeRegistry } from "./ThemeRegistry.js";
import type { CssVariableGenerator } from "../infrastructure/CssVariableGenerator.js";
import type { MonacoThemeAdapter } from "../infrastructure/MonacoThemeAdapter.js";

export class ThemeManager {
  private currentThemeId = "one-dark";

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

  public applyTheme(themeId: string, monacoInstance?: any): void {
    const theme = this.registry.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found in registry.`);
    }

    this.currentThemeId = themeId;

    // Apply CSS variables and Monaco adaptations
    this.cssGenerator.generateAndInject(theme);
    this.monacoAdapter.registerAndApply(theme, monacoInstance);

    // Publish event
    this.eventBus.publish(ThemeEventTypes.THEME_CHANGED, { themeId });
  }
}
