import type { CommandSearch, CommandExecutor, CommandHistory } from "@ocs/commands";
import type { Container } from "@ocs/common";
import { ipcMain } from "electron";

import { IpcChannels } from "../../../../shared/ipc-channels.js";

export function registerCommandsHandlers(container: Container): void {
  const searchEngine = container.resolve<CommandSearch>(Symbol.for("commandSearch"));
  const executor = container.resolve<CommandExecutor>(Symbol.for("commandExecutor"));
  const history = container.resolve<CommandHistory>(Symbol.for("commandHistory"));

  ipcMain.handle(IpcChannels.COMMANDS_SEARCH, (_event, query: string, limit?: number) => {
    const results = searchEngine.search(query, limit);
    return results;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle(IpcChannels.COMMANDS_EXECUTE, async (_event, commandId: string, args?: any) => {
    return await executor.execute(commandId, args);
  });

  ipcMain.handle(IpcChannels.COMMANDS_GET_HISTORY, () => {
    return history.getRecentIds();
  });
}
