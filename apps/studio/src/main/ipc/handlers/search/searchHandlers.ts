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

  ipcMain.handle(
    IpcChannels.SEARCH_REPLACE_ALL,
    async (_, { queryId, replaceText }: { queryId: string; replaceText: string }) => {
      const results = searchService.getCachedResults(queryId);
      if (results && results.length > 0) {
        await replaceService.executeReplaceAll(queryId, results, replaceText);
      }
    }
  );

  ipcMain.handle(
    IpcChannels.SEARCH_REPLACE_IN_FILE,
    async (
      _,
      { queryId, file, replaceText }: { queryId: string; file: string; replaceText: string }
    ) => {
      const results = searchService.getCachedResults(queryId);
      if (results) {
        const fileResult = results.find((r) => r.file === file);
        if (fileResult) {
          await replaceService.executeReplace({
            searchQueryId: queryId,
            file,
            replacementMatches: fileResult.matches.map((m) => ({
              ...m,
              replacementText: replaceText
            }))
          });
        }
      }
    }
  );

  ipcMain.handle(
    IpcChannels.SEARCH_REPLACE_MATCH,
    async (
      _,
      {
        queryId,
        file,
        matchIndex,
        replaceText
      }: { queryId: string; file: string; matchIndex: number; replaceText: string }
    ) => {
      const results = searchService.getCachedResults(queryId);
      if (results) {
        const fileResult = results.find((r) => r.file === file);
        if (fileResult && fileResult.matches[matchIndex]) {
          await replaceService.executeReplace({
            searchQueryId: queryId,
            file,
            replacementMatches: [
              { ...fileResult.matches[matchIndex], replacementText: replaceText }
            ]
          });
        }
      }
    }
  );
}
