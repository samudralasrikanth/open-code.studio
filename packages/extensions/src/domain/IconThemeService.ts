/* eslint-disable */
import * as fs from "fs/promises";
import * as path from "path";
import type { ExtensionRegistry } from "./ExtensionRegistry.js";
import type { Logger } from "@ocs/common";

export interface IconThemeDefinition {
  iconDefinitions?: Record<string, { iconPath: string }>;
  folderNames?: Record<string, string>;
  folderNamesExpanded?: Record<string, string>;
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  languageIds?: Record<string, string>;
  light?: IconThemeDefinition;
  highContrast?: IconThemeDefinition;
}

export interface ActiveIconTheme {
  id: string;
  definition: IconThemeDefinition;
  extensionId: string;
  extensionPath: string; // The root path of the extension (to resolve iconPath)
  themeDir?: string;
}

export class IconThemeService {
  private activeThemeId: string | null = null;
  private activeThemeCache: ActiveIconTheme | null = null;

  constructor(
    private readonly registry: ExtensionRegistry,
    private readonly logger: Logger
  ) {}

  public async getActiveTheme(): Promise<ActiveIconTheme | null> {
    if (this.activeThemeCache) {
      if (!this.activeThemeId || this.activeThemeCache.id === this.activeThemeId) {
        return this.activeThemeCache;
      }
    }

    // Find which extension provides this theme, or just pick the first available if no explicit theme is set
    const extensions = await this.registry.getAll();
    let themePath = "";
    let extensionId = "";
    let extensionPath = "";
    let matchedThemeId = this.activeThemeId;

    for (const ext of extensions) {
      if (!ext.enabled) continue;

      const iconThemes = ext.manifest.contributes?.iconThemes;
      if (Array.isArray(iconThemes) && iconThemes.length > 0) {
        let theme: any;
        if (this.activeThemeId) {
          theme = iconThemes.find(
            (t: any) => t.id === this.activeThemeId || t.label === this.activeThemeId
          );
        } else {
          theme = iconThemes[0];
          matchedThemeId = theme.id || theme.label;
        }

        if (theme && theme.path) {
          themePath = path.join(ext.path, "extension", theme.path);
          extensionId = ext.id;
          extensionPath = ext.path;
          break;
        }
      }
    }

    if (!themePath) {
      this.logger.warn(`Icon theme not found in any enabled extension`);
      return null;
    }

    try {
      const content = await fs.readFile(themePath, "utf-8");
      // JSON with comments is common in VS Code themes. Simple regex to strip single line comments if they exist.
      const jsonStr = content.replace(/\/\/.*$/gm, "");
      const definition = JSON.parse(jsonStr) as IconThemeDefinition;

      this.activeThemeCache = {
        id: matchedThemeId!,
        definition,
        extensionId,
        extensionPath,
        themeDir: path.dirname(themePath.replace(path.join(extensionPath, "extension") + "/", ""))
      };

      return this.activeThemeCache;
    } catch (err: any) {
      this.logger.error(`Failed to load icon theme ${this.activeThemeId}: ${err.message}`);
      return null;
    }
  }

  public setActiveTheme(themeId: string | null): void {
    this.activeThemeId = themeId;
    this.activeThemeCache = null;
  }
}
