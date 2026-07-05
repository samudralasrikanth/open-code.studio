/* eslint-disable */
import { useState, useEffect, useCallback } from "react";
import type { ActiveIconTheme, IconThemeDefinition } from "@ocs/extensions";

export function useIconTheme() {
  const [theme, setTheme] = useState<ActiveIconTheme | null>(null);

  useEffect(() => {
    let mounted = true;
    window.ocs.extensions.getActiveIconTheme().then((res) => {
      if (mounted && res.success && res.data) {
        setTheme(res.data as ActiveIconTheme);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getIconUrl = useCallback(
    (fileName: string, isDirectory: boolean, isExpanded?: boolean): string | null => {
      if (!theme || !theme.definition) return null;

      const def = theme.definition;
      const lowerName = fileName.toLowerCase();

      // Ensure we trim any leading dot from extension check
      const ext = lowerName.split(".").pop() || "";

      let iconKey: string | undefined;

      if (isDirectory) {
        if (isExpanded && def.folderNamesExpanded?.[lowerName]) {
          iconKey = def.folderNamesExpanded[lowerName];
        } else if (def.folderNames?.[lowerName]) {
          iconKey = def.folderNames[lowerName];
        } else if (isExpanded && def.folderNamesExpanded?.[""]) {
          // fallback expanded folder
          iconKey = def.folderNamesExpanded[""];
        } else {
          // fallback folder
          iconKey = def.folderNames?.[""] || "folder";
        }
      } else {
        if (def.fileNames?.[lowerName]) {
          iconKey = def.fileNames[lowerName];
        } else if (def.fileNames?.[fileName]) {
          iconKey = def.fileNames[fileName];
        } else if (def.fileExtensions?.[ext]) {
          iconKey = def.fileExtensions[ext];
        } else {
          iconKey = "file";
        }
      }

      if (iconKey && def.iconDefinitions?.[iconKey]) {
        let iconPath = def.iconDefinitions[iconKey].iconPath;
        // Strip leading ./ or /
        iconPath = iconPath.replace(/^\.?\//, "");
        if (theme.themeDir && theme.themeDir !== ".") {
          iconPath = `${theme.themeDir}/${iconPath}`;
        }
        return `ocs-ext://${theme.extensionId}/${iconPath}`;
      }

      return null;
    },
    [theme]
  );

  return { theme, getIconUrl };
}
