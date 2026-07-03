/* eslint-disable */
import type { Container, Logger } from "@ocs/common";
import { TerminalEventTypes, type TerminalService } from "@ocs/terminal";
import { ipcMain, webContents } from "electron";

import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerTerminalHandlers(container: Container): void {
  const terminalService = container.resolve<TerminalService>(Symbol.for("terminal"));
  const logger = container.resolve<Logger>(Symbol.for("logger"));
  const eventBus = container.resolve<any>(Symbol.for("events"));

  // 1. Create Terminal
  ipcMain.handle(IpcChannels.TERMINAL_CREATE, async (_, options: any) => {
    logger.info("IPC: Spawning new terminal session", { cwd: options.cwd });
    return terminalService.create(options);
  });

  // 2. Close Terminal
  ipcMain.handle(IpcChannels.TERMINAL_CLOSE, async (_, id: string) => {
    logger.info("IPC: Closing terminal session", { id });
    return terminalService.close(id);
  });

  // 3. Resize Terminal
  ipcMain.handle(IpcChannels.TERMINAL_RESIZE, async (_, id: string, cols: number, rows: number) => {
    return terminalService.resize(id, cols, rows);
  });

  // 4. Send Terminal Input
  ipcMain.handle(IpcChannels.TERMINAL_INPUT, async (_, id: string, text: string) => {
    return terminalService.sendInput(id, text);
  });

  // 5. List Terminal Sessions
  ipcMain.handle(IpcChannels.TERMINAL_LIST, () => {
    return terminalService.getSessions();
  });

  // 6. Output & Exit Event Streaming from Event Bus to Renderer
  if (eventBus) {
    eventBus.subscribe(TerminalEventTypes.OUTPUT, (event: any) => {
      const { id, data } = event.payload;
      webContents.getAllWebContents().forEach((wc) => {
        if (!wc.isDestroyed()) {
          wc.send(IpcChannels.TERMINAL_OUTPUT, { id, data });
        }
      });
    });

    eventBus.subscribe(TerminalEventTypes.STOPPED, (event: any) => {
      const { id, exitCode } = event.payload;
      webContents.getAllWebContents().forEach((wc) => {
        if (!wc.isDestroyed()) {
          wc.send(IpcChannels.TERMINAL_EXIT, { id, exitCode });
        }
      });
    });
  }
}
