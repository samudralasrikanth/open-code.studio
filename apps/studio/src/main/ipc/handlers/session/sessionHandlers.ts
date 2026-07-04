import { ipcMain, BrowserWindow } from "electron";
import type { Container } from "@ocs/common";
import { SessionManager } from "@ocs/session";
import { SessionEventTypes } from "@ocs/common/events";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerSessionHandlers(container: Container): void {
  const manager = container.resolve<SessionManager>(Symbol.for("SessionManager"));
  const eventBus = container.resolve<any>(Symbol.for("events"));

  ipcMain.handle(IpcChannels.SESSION_LOAD, async (_, workspaceId: string) => {
    manager.setActiveWorkspace(workspaceId);
    return manager.loadSession();
  });

  ipcMain.handle(IpcChannels.SESSION_SAVE, async (_, snapshot: any, immediate?: boolean) => {
    manager.updateSnapshot(snapshot, immediate);
  });

  // Forward session modified event to all renderer windows
  eventBus.subscribe(SessionEventTypes.SESSION_MODIFIED, (event: any) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannels.SESSION_CHANGED, event.payload);
    }
  });
}
