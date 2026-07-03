/* eslint-disable */
import type { Container, Logger } from "@ocs/common";
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
  type ExplorerService,
  type WorkspaceProvider
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
  const provider = explorerService.getProvider<WorkspaceProvider>("explorer.provider.workspace");
  if (!provider) {
    throw new Error("Workspace explorer provider is not registered.");
  }

  logger.flow({
    domain: "workspace",
    source: "main",
    action: "explorer-setup:set-root",
    correlationId,
    context: { workspaceUri: workspace.uri }
  });
  provider.setRoot(workspace.uri);

  logger.flow({
    domain: "workspace",
    source: "main",
    action: "explorer-setup:open-root:start",
    correlationId
  });
  await explorerService.openWorkspaceRoot();
  logger.flow({
    domain: "workspace",
    source: "main",
    action: "explorer-setup:open-root:done",
    correlationId,
    context: {
      rootId: explorerService.treeModel.getRootId(),
      visibleNodes: explorerService.treeModel.getVisibleNodes().length
    }
  });

  if (activeWatcher && watchedUri) {
    await teardownWorkspaceExplorer(container, logger, correlationId);
  }

  activeWatcher = new NodeWatcher();
  watchedUri = workspace.uri;
  try {
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "explorer-setup:watch:start",
      correlationId,
      context: { watchedUri }
    });
    await activeWatcher.watch(workspace.uri, (events) => {
      logger.flow({
        domain: "explorer",
        source: "main",
        action: "watch:events",
        context: { count: events.length }
      });
      void explorerService.handleFileWatchEvents(events);
    });
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "explorer-setup:watch:done",
      correlationId,
      context: { watchedUri }
    });
  } catch (error) {
    activeWatcher = null;
    watchedUri = null;
    logger.error("[flow:workspace] main: explorer-setup:watch:failed", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
  logger.flow({
    domain: "workspace",
    source: "main",
    action: "explorer-setup:done",
    correlationId,
    context: {
      rootId: explorerService.treeModel.getRootId(),
      visibleNodes: explorerService.treeModel.getVisibleNodes().length
    }
  });
}

export async function teardownWorkspaceExplorer(
  _container: Container,
  logger: Logger,
  correlationId: string
): Promise<void> {
  if (activeWatcher && watchedUri) {
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "explorer-setup:unwatch-previous",
      correlationId,
      context: { watchedUri }
    });
    await activeWatcher.unwatch(watchedUri as import("@ocs/workspace").WorkspaceUri);
    activeWatcher = null;
    watchedUri = null;
  }
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
    async (_, providerId: string, nodeId: string) => {
      await explorerService.expandNode(providerId, nodeId);
    }
  );

  ipcMain.handle(IpcChannels.EXPLORER_COLLAPSE_NODE, (_, nodeId: string) => {
    explorerService.collapseNode(nodeId);
  });

  ipcMain.handle(IpcChannels.EXPLORER_SELECT_NODE, (_, nodeId: string, multi: boolean) => {
    explorerService.selectNode(nodeId, multi);
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
        const parentId = args.uri.slice(0, args.uri.lastIndexOf("/"));
        if (explorerService.treeModel.getNode(parentId)) {
          await explorerService.refresh(explorerService.getProviderId(), parentId);
        }
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
        await explorerService.refresh(explorerService.getProviderId(), null);
        await explorerService.openWorkspaceRoot();
        return;
      }

      throw new Error(`Unknown explorer command: ${commandId}`);
    }
  );

  ipcMain.handle(IpcChannels.EXPLORER_REVEAL_IN_FINDER, async (_, uri: string) => {
    const { shell } = await import("electron");
    shell.showItemInFolder(uriToPath(uriFromString(uri)));
  });

  explorerService.eventBus.on("explorer.refreshCompleted", () => broadcastExplorerState(logger));
  explorerService.eventBus.on("explorer.nodeExpanded", () => broadcastExplorerState(logger));
  explorerService.eventBus.on("explorer.nodeCollapsed", () => broadcastExplorerState(logger));
  explorerService.eventBus.on("explorer.selectionChanged", () => broadcastExplorerState(logger));
}
