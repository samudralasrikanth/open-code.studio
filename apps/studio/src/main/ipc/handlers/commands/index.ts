/* eslint-disable */
import type { Container } from "@ocs/common";
import { ipcMain } from "electron";
import { uriFromString } from "@ocs/workspace";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerCommandHandlers(container: Container): void {
  const commandRegistry = container.resolve<import("@ocs/common").CommandRegistry>(
    Symbol.for("commands")
  );

  ipcMain.handle(
    IpcChannels.COMMAND_EXECUTE,
    async (_, commandId: string, args: { uri?: string }) => {
      if (commandId === "document.save" && args?.uri) {
        args.uri = uriFromString(args.uri) as any;
      }
      return commandRegistry.executeCommand(commandId, args);
    }
  );
}
