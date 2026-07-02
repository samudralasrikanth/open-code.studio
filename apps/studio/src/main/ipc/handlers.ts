/* eslint-disable */
import type { Container } from "@ocs/common";
import type { IpcMainInvokeEvent } from "electron";
import { ipcMain } from "electron";

import { IpcChannels } from "../../shared/ipc-channels.js";

/**
 * Register all IPC handlers for the main process.
 *
 * Handlers are defined here and communicate with the renderer only through
 * the typed channels declared in shared/ipc-channels.ts.
 */
export function registerIpcHandlers(container: Container): void {
  // ── Health ─────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.HEALTH_CHECK, async (_event: IpcMainInvokeEvent) => {
    return {
      status: "ok",
      version: process.versions.electron,
      timestamp: new Date().toISOString()
    };
  });

  // ── Theme ──────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.THEME_GET, async () => {
    // Theme persistence will be wired to config service; return default for now
    return "dark";
  });

  ipcMain.handle(IpcChannels.THEME_SET, async (_event, theme: "dark" | "light" | "system") => {
    const { nativeTheme } = await import("electron");
    nativeTheme.themeSource = theme === "system" ? "system" : theme;
    return true;
  });

  // ── Platform Info ──────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.PLATFORM_INFO, async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      appVersion: (await import("electron")).app.getVersion()
    };
  });

  // ── Workspace ──────────────────────────────────────────────────────────────
  const workspaceService = container.resolve<import("@ocs/workspace").WorkspaceService>(
    Symbol.for("workspace")
  );
  type Workspace = import("@ocs/workspace").Workspace;

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN_FOLDER_DIALOG, async () => {
    const { dialog } = await import("electron");
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    return { canceled, folderPath: canceled ? null : filePaths[0] };
  });

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN, async (_, path: string): Promise<Workspace | null> => {
    const workspace = await workspaceService.open(path);
    if (workspace) {
      // Find the workspace provider and set its root
      const provider = (explorerService as any).providers.get("explorer.provider.workspace");
      if (provider) {
        provider.setRoot(workspace.uri);
        await explorerService.refresh("explorer.provider.workspace", null);
      }
    }
    return workspace;
  });

  ipcMain.handle(IpcChannels.WORKSPACE_CLOSE, async () => {
    return workspaceService.close();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_GET_ACTIVE, () => {
    return workspaceService.getActive();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_GET_RECENT, () => {
    return workspaceService.getRecent();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_REMOVE_RECENT, async (_, id: string): Promise<void> => {
    return workspaceService.removeRecent(id);
  });

  // ── Explorer ───────────────────────────────────────────────────────────────
  const explorerService = container.resolve<import("@ocs/explorer").ExplorerService>(
    Symbol.for("explorer")
  );

  ipcMain.handle(IpcChannels.EXPLORER_GET_VISIBLE_NODES, () => {
    return explorerService.treeModel.getVisibleNodes();
  });

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

  // Wire up state change events to push to renderer
  // We need the windowManager to push events to the main window.
  // For now we can use webContents.getAllWebContents() to broadcast.
  const { webContents } = require("electron");
  explorerService.eventBus.on("explorer.refreshCompleted", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
  explorerService.eventBus.on("explorer.nodeExpanded", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
  explorerService.eventBus.on("explorer.nodeCollapsed", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
  explorerService.eventBus.on("explorer.selectionChanged", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
}
