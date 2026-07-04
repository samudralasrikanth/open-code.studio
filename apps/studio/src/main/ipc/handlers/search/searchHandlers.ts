import { ipcMain } from "electron";
import { Container } from "@ocs/common";
import { SearchService, ReplaceService, SearchQuery, ReplaceOperation } from "@ocs/search";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

import { uriToPath } from "@ocs/workspace";

export function registerSearchHandlers(container: Container): void {
  const searchService = container.resolve<SearchService>(Symbol.for("SearchService"));
  const replaceService = container.resolve<ReplaceService>(Symbol.for("ReplaceService"));

  ipcMain.handle(IpcChannels.SEARCH_START, async (_, query: SearchQuery, cwd?: string) => {
    try {
      const rawPath =
        typeof cwd === "string" ? cwd : (query as any)?.rootUri || (query as any)?.cwd || "";
      const fsPath = rawPath.startsWith("file://") ? uriToPath(rawPath as any) : rawPath;
      if (fsPath) {
        await searchService.executeSearch(query, fsPath);
      }
    } catch (err: any) {
      console.error("[SEARCH_START IPC] ERROR:", err.message, err.stack);
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.SEARCH_CANCEL, async (_, queryId: string) => {
    searchService.cancelSearch(queryId);
  });

  ipcMain.handle(IpcChannels.SEARCH_REPLACE, async (_, operation: ReplaceOperation) => {
    await replaceService.executeReplace(operation);
  });
}
