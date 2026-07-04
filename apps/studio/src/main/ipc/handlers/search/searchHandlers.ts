import { ipcMain } from "electron";
import { Container } from "@ocs/common";
import { SearchService, ReplaceService, SearchQuery, ReplaceOperation } from "@ocs/search";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

import { uriToPath } from "@ocs/workspace";

export function registerSearchHandlers(container: Container): void {
  const searchService = container.resolve<SearchService>(Symbol.for("SearchService"));
  const replaceService = container.resolve<ReplaceService>(Symbol.for("ReplaceService"));

  ipcMain.handle(IpcChannels.SEARCH_START, async (_, query: SearchQuery, cwd: string) => {
    const fsPath = cwd.startsWith("file://") ? uriToPath(cwd) : cwd;
    searchService.executeSearch(query, fsPath).catch((err) => {
      console.error("Search failed:", err);
    });
  });

  ipcMain.handle(IpcChannels.SEARCH_CANCEL, async (_, queryId: string) => {
    searchService.cancelSearch(queryId);
  });

  ipcMain.handle(IpcChannels.SEARCH_REPLACE, async (_, operation: ReplaceOperation) => {
    await replaceService.executeReplace(operation);
  });
}
