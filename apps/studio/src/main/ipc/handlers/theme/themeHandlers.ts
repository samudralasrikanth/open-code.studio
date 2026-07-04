import { ipcMain, BrowserWindow } from "electron";
import type { Container } from "@ocs/common";
import { ThemeManager, ThemeRegistry } from "@ocs/theme";
import { ThemeEventTypes } from "@ocs/common/events";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerThemeHandlers(container: Container): void {
  const themeManager = container.resolve<ThemeManager>(Symbol.for("ThemeManager"));
  const themeRegistry = container.resolve<ThemeRegistry>(Symbol.for("ThemeRegistry"));
  const eventBus = container.resolve<any>(Symbol.for("events"));

  ipcMain.handle(IpcChannels.THEME_GET, async () => {
    const theme = themeManager.getActiveTheme();
    return {
      activeId: theme.id,
      theme,
      all: themeRegistry.getAll().map((t) => ({ id: t.id, name: t.name, type: t.type }))
    };
  });

  ipcMain.handle(IpcChannels.THEME_SET, async (_, themeId: string) => {
    themeManager.applyTheme(themeId);
    return themeManager.getActiveTheme();
  });

  // Listen for main-side theme change events and push to all renderer windows
  eventBus.subscribe(ThemeEventTypes.THEME_CHANGED, (event: any) => {
    const { themeId } = event.payload;
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannels.THEME_CHANGED, { themeId });
    }
  });
}
