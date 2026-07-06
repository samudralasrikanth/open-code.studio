/* eslint-disable */
import { URI, type Container, type Logger } from "@ocs/common";
import { ipcMain, webContents } from "electron";
import { uriFromString, uriToPath } from "@ocs/workspace";
import {
  CreateFileCommand,
  CreateFileCommandHandler,
  DeleteFileCommand,
  DeleteFileCommandHandler,
  RenameFileCommand,
  RenameFileCommandHandler,
  NodeWatcher,
  type ExplorerService
} from "@ocs/explorer";
import { IpcChannels } from "../../../../shared/ipc-channels.js";

let activeWatcher: NodeWatcher | null = null;
let watchedUri: string | null = null;

function broadcastExplorerState(logger: Logger): void {
  logger.flow({ domain: "explorer", source: "main", action: "broadcast-state" });
  webContents.getAllWebContents().forEach((wc) => {
    wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
  });
}

export async function setupWorkspaceExplorer(
  container: Container,
  workspace: import("@ocs/workspace").Workspace,
  logger: Logger,
  correlationId: string
): Promise<void> {
  const explorerService = container.resolve<ExplorerService>(Symbol.for("explorer"));

  logger.flow({
    domain: "workspace",
    source: "main",
    action: "explorer-setup:start",
    correlationId,
    context: { workspaceId: workspace.id, workspaceUri: workspace.uri }
  });

  explorerService.refreshRoots();

  logger.flow({
    domain: "workspace",
    source: "main",
    action: "explorer-setup:done",
    correlationId,
    context: {
      visibleNodes: explorerService.treeModel.getVisibleNodes().length
    }
  });
}

export async function teardownWorkspaceExplorer(
  _container: Container,
  _logger: Logger,
  _correlationId: string
): Promise<void> {
  // No-op for now since watcher is handled elsewhere or not at all in this simple version
}

export function getExplorerWatcherState(): {
  activeWatcher: NodeWatcher | null;
  watchedUri: string | null;
} {
  return { activeWatcher, watchedUri };
}

export function registerExplorerHandlers(container: Container): void {
  const explorerService = container.resolve<ExplorerService>(Symbol.for("explorer"));
  const logger = container.resolve<Logger>(Symbol.for("logger"));

  const createFileHandler = new CreateFileCommandHandler();
  const deleteFileHandler = new DeleteFileCommandHandler();
  const renameFileHandler = new RenameFileCommandHandler();

  ipcMain.handle(IpcChannels.EXPLORER_GET_VISIBLE_NODES, () =>
    explorerService.treeModel.getVisibleNodes()
  );

  ipcMain.handle(IpcChannels.EXPLORER_GET_STATS, () => ({
    visibleNodes: explorerService.treeModel.getVisibleNodes().length,
    totalNodes: explorerService.treeModel.getTotalNodeCount(),
    expandedCount: explorerService.treeModel.getExpandedCount(),
    selectedNodeIds: explorerService.treeModel.getSelectedNodeIds()
  }));

  ipcMain.handle(
    IpcChannels.EXPLORER_EXPAND_NODE,
    async (_, _providerId: string, nodeId: string) => {
      // providerId is ignored now as we parse nodeId as URI
      await explorerService.expandNode(URI.parse(nodeId));
    }
  );

  ipcMain.handle(IpcChannels.EXPLORER_COLLAPSE_NODE, (_, nodeId: string) => {
    explorerService.collapseNode(URI.parse(nodeId));
  });

  ipcMain.handle(IpcChannels.EXPLORER_SELECT_NODE, (_, nodeId: string, multi: boolean) => {
    explorerService.selectNode(URI.parse(nodeId), multi);
  });

  ipcMain.handle(
    IpcChannels.EXPLORER_EXECUTE_COMMAND,
    async (
      _,
      commandId: string,
      args: { uri?: string; targetUri?: string; isDirectory?: boolean }
    ) => {
      if (commandId === "explorer.command.createFile" && args.uri) {
        await createFileHandler.execute(
          new CreateFileCommand(uriFromString(args.uri), args.isDirectory ?? false)
        );
        explorerService.refreshRoots();
        return;
      }

      if (commandId === "explorer.command.deleteFile" && args.uri) {
        await deleteFileHandler.execute(new DeleteFileCommand(uriFromString(args.uri)));
        explorerService.treeModel.removeNode(args.uri);
        broadcastExplorerState(logger);
        return;
      }

      if (commandId === "explorer.command.renameFile" && args.uri && args.targetUri) {
        await renameFileHandler.execute(
          new RenameFileCommand(uriFromString(args.uri), uriFromString(args.targetUri))
        );
        explorerService.refreshRoots();
        return;
      }

      throw new Error(`Unknown explorer command: ${commandId}`);
    }
  );

  ipcMain.handle(IpcChannels.EXPLORER_REVEAL_IN_FINDER, async (_, uri: string) => {
    const { shell } = await import("electron");
    shell.showItemInFolder(uriToPath(uriFromString(uri)));
  });

  explorerService.treeModel.onTreeChanged(() => broadcastExplorerState(logger));
}
