import { ipcMain } from "electron";

import { IpcChannels } from "../../../../shared/ipc-channels.js";
import { getGitService } from "../../../bootstrap/git.js";

export function registerGitHandlers(): void {
  ipcMain.handle(IpcChannels.GIT_STATUS, () => {
    return getGitService().getStatus();
  });

  ipcMain.handle(IpcChannels.GIT_COMMIT, (_, message: string) => {
    return getGitService().commit(message);
  });

  ipcMain.handle(IpcChannels.GIT_PULL, () => {
    // In a real implementation this would call git pull
    return Promise.resolve();
  });

  ipcMain.handle(IpcChannels.GIT_PUSH, () => {
    // In a real implementation this would call git push
    return Promise.resolve();
  });

  ipcMain.handle(IpcChannels.GIT_HISTORY, async (_, filePath?: string) => {
    try {
      return await getGitService().getHistory(filePath);
    } catch (e) {
      console.error("Failed to get git history", e);
      return [];
    }
  });
}
