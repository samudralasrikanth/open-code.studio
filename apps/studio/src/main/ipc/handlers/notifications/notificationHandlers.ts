import { ipcMain, BrowserWindow } from "electron";
import type { Container } from "@ocs/common";
import { NotificationService } from "@ocs/notifications";
import { NotificationEventTypes } from "@ocs/common/events";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerNotificationHandlers(container: Container): void {
  const service = container.resolve<NotificationService>(Symbol.for("NotificationService"));
  const eventBus = container.resolve<any>(Symbol.for("events"));

  ipcMain.handle(IpcChannels.NOTIFICATIONS_CREATE, async (_, opt: any) => {
    return service.create(opt);
  });

  ipcMain.handle(IpcChannels.NOTIFICATIONS_UPDATE, async (_, id: string, updates: any) => {
    service.update(id, updates);
  });

  ipcMain.handle(IpcChannels.NOTIFICATIONS_DISMISS, async (_, id: string) => {
    service.dismiss(id);
  });

  ipcMain.handle(IpcChannels.NOTIFICATIONS_CLEAR, async () => {
    service.clear();
  });

  ipcMain.handle(IpcChannels.NOTIFICATIONS_GET_ACTIVE, async () => {
    return service.getActive();
  });

  ipcMain.handle(IpcChannels.NOTIFICATIONS_GET_HISTORY, async () => {
    return service.getHistory();
  });

  // Notify renderer when active notifications change
  const forwardEvent = (type: string) => {
    eventBus.subscribe(type, (event: any) => {
      for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send(IpcChannels.NOTIFICATIONS_CHANGED, {
          eventType: type,
          payload: event.payload
        });
      }
    });
  };

  forwardEvent(NotificationEventTypes.NOTIFICATION_CREATED);
  forwardEvent(NotificationEventTypes.NOTIFICATION_UPDATED);
  forwardEvent(NotificationEventTypes.NOTIFICATION_DISMISSED);
}
