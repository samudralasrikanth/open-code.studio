import { ipcMain } from "electron";
import { Container } from "@ocs/common";
import { SettingsService, SettingScope } from "@ocs/settings";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerSettingsHandlers(container: Container): void {
  const settingsService = container.resolve<SettingsService>(Symbol.for("SettingsService"));

  ipcMain.handle(IpcChannels.SETTINGS_GET, async (_, id: string) => {
    return settingsService.get(id);
  });

  ipcMain.handle(IpcChannels.SETTINGS_GET_ALL, async () => {
    return settingsService.getAllResolved();
  });

  ipcMain.handle(
    IpcChannels.SETTINGS_SET,
    async (_, id: string, value: any, scope: SettingScope) => {
      await settingsService.set(id, value, scope);
    }
  );

  ipcMain.handle(IpcChannels.SETTINGS_RESET, async (_, id: string, scope: SettingScope) => {
    await settingsService.reset(id, scope);
  });
}
