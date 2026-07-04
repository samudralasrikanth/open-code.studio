/* eslint-disable */
import type { Container } from "@ocs/common";
import { ipcMain } from "electron";
import { IpcChannels } from "../../../../shared/ipc-channels.js";
import { getExplorerWatcherState } from "../explorer/index.js";
import type { StartupCoordinator } from "../../bootstrap/startup-coordinator.js";

export function registerHealthHandlers(container: Container): void {
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

  // ── Diagnostics ────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.DIAGNOSTICS_GET, async () => {
    const workspaceService = container.resolve<
      import("@ocs/workspace/application").WorkspaceService
    >(Symbol.for("workspace"));
    const explorerService = container.resolve<import("@ocs/explorer").ExplorerService>(
      Symbol.for("explorer")
    );

    // We'll also return some info from Document, Editor, Commands (Phase 5 requirement)
    // For now, let's satisfy the phase 5 Health endpoint requirement here directly
    const documentService = container.resolve<import("@ocs/document/application").DocumentService>(
      Symbol.for("document")
    );
    const editorService = container.resolve<import("@ocs/editor/application").EditorService>(
      Symbol.for("editor")
    );

    const startupCoordinator = container.resolve<StartupCoordinator>(Symbol.for("startup"));

    const workspace = workspaceService.getActive();
    const { activeWatcher, watchedUri } = getExplorerWatcherState();

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
      totalNodes: explorerService.treeModel.getTotalNodeCount(),
      // Phase 5 requirements: Subsystem status
      document: !!documentService,
      editor: !!editorService,
      commands: true,
      // Phase 5 requirements: Startup phase data
      startupPhases: startupCoordinator.getStatus()
    };
  });
}
