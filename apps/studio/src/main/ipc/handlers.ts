/* eslint-disable */
import type { Container } from "@ocs/common";
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
import { EditorEventTypes } from "@ocs/editor";
import { uriFromString, uriToPath } from "@ocs/workspace";
import type { IpcMainInvokeEvent } from "electron";
import { ipcMain, webContents } from "electron";

import { IpcChannels } from "../../shared/ipc-channels.js";

let activeWatcher: NodeWatcher | null = null;
let watchedUri: string | null = null;

function broadcastExplorerState(): void {
  webContents.getAllWebContents().forEach((wc) => {
    wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
  });
}

async function setupWorkspaceExplorer(
  explorerService: ExplorerService,
  workspace: import("@ocs/workspace").Workspace
): Promise<void> {
  const providers = (explorerService as unknown as { providers: Map<string, WorkspaceProvider> })
    .providers;
  const provider = providers.get("explorer.provider.workspace");
  if (!provider) return;

  provider.setRoot(workspace.uri);
  await explorerService.openWorkspaceRoot();

  if (activeWatcher && watchedUri) {
    await activeWatcher.unwatch(watchedUri as import("@ocs/workspace").WorkspaceUri);
  }

  activeWatcher = new NodeWatcher();
  watchedUri = workspace.uri;
  await activeWatcher.watch(workspace.uri, (events) => {
    void explorerService.handleFileWatchEvents(events);
  });
}

/**
 * Register all IPC handlers for the main process.
 */
export function registerIpcHandlers(container: Container): void {
  const workspaceService = container.resolve<import("@ocs/workspace/application").WorkspaceService>(
    Symbol.for("workspace")
  );
  const explorerService = container.resolve<ExplorerService>(Symbol.for("explorer"));
  const documentService = container.resolve<import("@ocs/document/application").DocumentService>(
    Symbol.for("document")
  );
  const editorService = container.resolve<import("@ocs/editor/application").EditorService>(
    Symbol.for("editor")
  );
  const commandRegistry = container.resolve<import("@ocs/common").CommandRegistry>(
    Symbol.for("commands")
  );

  type Workspace = import("@ocs/workspace").Workspace;

  const createFileHandler = new CreateFileCommandHandler();
  const deleteFileHandler = new DeleteFileCommandHandler();
  const renameFileHandler = new RenameFileCommandHandler();

  // ── Health ─────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.HEALTH_CHECK, async () => ({
    status: "ok",
    version: process.versions.electron,
    timestamp: new Date().toISOString()
  }));

  ipcMain.handle(IpcChannels.PLATFORM_INFO, async () => ({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron,
    appVersion: (await import("electron")).app.getVersion()
  }));

  // ── Theme ──────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.THEME_GET, async () => "dark");

  ipcMain.handle(IpcChannels.THEME_SET, async (_event, theme: "dark" | "light" | "system") => {
    const { nativeTheme } = await import("electron");
    nativeTheme.themeSource = theme === "system" ? "system" : theme;
    return true;
  });

  // ── Window controls ────────────────────────────────────────────────────────
  ipcMain.on(IpcChannels.APP_MINIMIZE, () => {
    const win = require("electron").BrowserWindow.getFocusedWindow();
    win?.minimize();
  });

  ipcMain.on(IpcChannels.APP_TOGGLE_MAXIMIZE, () => {
    const win = require("electron").BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });

  ipcMain.on(IpcChannels.APP_QUIT, () => {
    require("electron").app.quit();
  });

  ipcMain.handle(IpcChannels.APP_IS_MAXIMIZED, () => {
    const win = require("electron").BrowserWindow.getFocusedWindow();
    return win?.isMaximized() ?? false;
  });

  // ── Workspace ──────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.WORKSPACE_OPEN_FOLDER_DIALOG, async () => {
    const { dialog } = await import("electron");
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    return { canceled, folderPath: canceled ? null : filePaths[0] };
  });

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN, async (_, path: string): Promise<Workspace | null> => {
    if (workspaceService.isOpen()) {
      const current = workspaceService.getActive();
      const targetUri = uriFromPath(path);
      if (current?.uri === targetUri) {
        return current;
      }
      if (activeWatcher && watchedUri) {
        await activeWatcher.unwatch(watchedUri as import("@ocs/workspace").WorkspaceUri);
        activeWatcher = null;
        watchedUri = null;
      }
      await workspaceService.close();
    }

    const workspace = await workspaceService.open(path);
    if (workspace) {
      await setupWorkspaceExplorer(explorerService, workspace);
    }
    return workspace;
  });

  ipcMain.handle(IpcChannels.WORKSPACE_CLOSE, async () => {
    if (activeWatcher && watchedUri) {
      await activeWatcher.unwatch(watchedUri as import("@ocs/workspace").WorkspaceUri);
      activeWatcher = null;
      watchedUri = null;
    }
    return workspaceService.close();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_GET_ACTIVE, () => workspaceService.getActive());

  ipcMain.handle(IpcChannels.WORKSPACE_GET_RECENT, () => workspaceService.getRecent());

  ipcMain.handle(IpcChannels.WORKSPACE_GET_LAST_OPENED, () => workspaceService.getLastOpenedUri());

  ipcMain.handle(IpcChannels.WORKSPACE_REMOVE_RECENT, async (_, id: string): Promise<void> =>
    workspaceService.removeRecent(id)
  );

  // ── Explorer ───────────────────────────────────────────────────────────────
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
      const { uriFromString } = await import("@ocs/workspace");

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
        broadcastExplorerState();
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

  explorerService.eventBus.on("explorer.refreshCompleted", broadcastExplorerState);
  explorerService.eventBus.on("explorer.nodeExpanded", broadcastExplorerState);
  explorerService.eventBus.on("explorer.nodeCollapsed", broadcastExplorerState);
  explorerService.eventBus.on("explorer.selectionChanged", broadcastExplorerState);

  // ── Diagnostics ────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.DIAGNOSTICS_GET, async () => {
    const workspace = workspaceService.getActive();
    return {
      desktop: true,
      workspace: workspace !== null,
      explorer: explorerService.treeModel.getRootId() !== null,
      fileWatcher: activeWatcher !== null && watchedUri !== null,
      eventBus: true,
      logger: true,
      ipc: true,
      visibleNodes: explorerService.treeModel.getVisibleNodes().length,
      expandedCount: explorerService.treeModel.getExpandedCount(),
      totalNodes: explorerService.treeModel.getTotalNodeCount()
    };
  });

  // ── Document ───────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.DOCUMENT_OPEN, async (_, uriStr: string) => {
    const uri = uriFromString(uriStr);
    const doc = await documentService.openDocument(uri);
    return {
      uri: doc.uri.toString(),
      type: doc.type,
      isDirty: doc.isDirty,
      isReadonly: doc.isReadonly,
      content: doc.type === "text" ? (doc as import("@ocs/document").ITextDocument).getText() : null
    };
  });

  ipcMain.handle(IpcChannels.DOCUMENT_CLOSE, async (_, uriStr: string) => {
    documentService.closeDocument(uriFromString(uriStr));
  });

  ipcMain.handle(IpcChannels.DOCUMENT_SAVE, async (_, uriStr: string) => {
    await documentService.saveDocument(uriFromString(uriStr));
  });

  ipcMain.handle(IpcChannels.DOCUMENT_GET, async (_, uriStr: string) => {
    const doc = await documentService.openDocument(uriFromString(uriStr));
    return {
      uri: doc.uri.toString(),
      type: doc.type,
      isDirty: doc.isDirty,
      isReadonly: doc.isReadonly,
      content: doc.type === "text" ? (doc as import("@ocs/document").ITextDocument).getText() : null
    };
  });

  // ── Editor ─────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.EDITOR_OPEN, async (_, inputStr: string, options?: unknown) => {
    const uri = uriFromString(inputStr);
    const doc = await documentService.openDocument(uri);
    const { DocumentEditorInput } = require("@ocs/editor");
    editorService.openEditor(new DocumentEditorInput(doc), options);
  });

  ipcMain.handle(IpcChannels.EDITOR_CLOSE, async (_, inputStr: string, groupId?: string) => {
    const uri = uriFromString(inputStr);
    const group = groupId
      ? editorService.groups.find((g: { id: string }) => g.id === groupId)
      : undefined;

    const performClose = async (
      input: { isDirty: () => boolean; getName: () => string },
      g: unknown
    ) => {
      if (input.isDirty()) {
        const { dialog } = await import("electron");
        const result = await dialog.showMessageBox({
          type: "warning",
          buttons: ["Save", "Don't Save", "Cancel"],
          title: "Save changes?",
          message: `Do you want to save the changes you made to ${input.getName()}?`,
          detail: "Your changes will be lost if you don't save them.",
          cancelId: 2
        });

        if (result.response === 0) {
          await documentService.saveDocument(uri);
        } else if (result.response === 2) {
          return;
        }
      }
      editorService.closeEditor(input, g);
    };

    if (group) {
      const input = group.inputs.find((i: { id: string }) => i.id === uri.toString());
      if (input) await performClose(input, group);
    } else {
      for (const g of editorService.groups) {
        const input = (g as { inputs: { id: string }[] }).inputs.find(
          (i) => i.id === uri.toString()
        );
        if (input) await performClose(input, g);
      }
    }
  });

  ipcMain.handle(IpcChannels.EDITOR_GET_STATE, () => ({
    groups: editorService.groups.map(
      (g: {
        id: string;
        inputs: { id: string }[];
        activeInput?: { id: string };
        previewInput?: { id: string };
      }) => ({
        id: g.id,
        inputs: g.inputs.map((i) => i.id),
        activeInput: g.activeInput?.id,
        previewInput: g.previewInput?.id
      })
    ),
    activeGroup: editorService.activeGroup?.id
  }));

  const broadcastEditorState = () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EDITOR_STATE_CHANGED, {
        groups: editorService.groups.map(
          (g: {
            id: string;
            inputs: { id: string }[];
            activeInput?: { id: string };
            previewInput?: { id: string };
          }) => ({
            id: g.id,
            inputs: g.inputs.map((i) => i.id),
            activeInput: g.activeInput?.id,
            previewInput: g.previewInput?.id
          })
        ),
        activeGroup: editorService.activeGroup?.id
      });
    });
  };

  editorService.eventBus.on("editor.opened", broadcastEditorState);
  editorService.eventBus.on("editor.closed", broadcastEditorState);
  editorService.eventBus.on(EditorEventTypes.EDITOR_ACTIVE_CHANGED, broadcastEditorState);

  // ── Commands ───────────────────────────────────────────────────────────────
  ipcMain.handle(
    IpcChannels.COMMAND_EXECUTE,
    async (_, commandId: string, args: { uri?: string }) => {
      if (commandId === "document.save" && args?.uri) {
        args.uri = uriFromString(args.uri);
      }
      return commandRegistry.executeCommand(commandId, args);
    }
  );
}

/** Restore the last workspace on startup. Called from main.ts after services init. */
export async function restoreLastWorkspace(container: Container): Promise<boolean> {
  const workspaceService = container.resolve<import("@ocs/workspace/application").WorkspaceService>(
    Symbol.for("workspace")
  );
  const lastUri = workspaceService.getLastOpenedUri();
  if (!lastUri) return false;

  const { uriToPath } = await import("@ocs/workspace");
  try {
    const workspace = await workspaceService.open(uriToPath(lastUri));
    if (workspace) {
      const explorerService = container.resolve<ExplorerService>(Symbol.for("explorer"));
      await setupWorkspaceExplorer(explorerService, workspace);
      return true;
    }
  } catch {
    // Folder may have been moved or deleted — fall through to welcome screen
  }
  return false;
}
