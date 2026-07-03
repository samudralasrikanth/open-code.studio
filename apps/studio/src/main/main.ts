/* eslint-disable */
import { join } from "path";

import { createContainer } from "@ocs/common";
import { createLifecycleManager } from "@ocs/common";
import { createLogger } from "@ocs/common";
import { WorkspaceSettingsRepository } from "@ocs/workspace/application";
import { WorkspaceRegistry } from "@ocs/workspace/application";
import { createWorkspaceService } from "@ocs/workspace/application";
import type { PersistedWorkspaceState } from "@ocs/workspace/application";
import { createJsonStorageAdapter, createLocalFileSystem } from "@ocs/workspace";
import {
  ExplorerService,
  TreeModel,
  ExplorerEventBus,
  WorkspaceProvider,
  LocalVirtualFileSystem
} from "@ocs/explorer";
import { DocumentService } from "@ocs/document/application";
import { EditorService } from "@ocs/editor/application";
import { CommandRegistry } from "@ocs/common";
import { SaveDocumentCommand } from "@ocs/document/application";
import { app, BrowserWindow, shell } from "electron";

import { registerIpcHandlers, restoreLastWorkspace } from "./ipc/handlers.js";
import { createApplicationMenu } from "./menu.js";
import { createWindowManager } from "./window-manager.js";
import type { WindowManager } from "./window-manager.js";

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const container = createContainer();
const lifecycle = createLifecycleManager();
const logger = createLogger({ level: "info" });

let windowManager: WindowManager;

// ─── Workspace Infrastructure ──────────────────────────────────────────────────

const userDataPath = app.getPath("userData");
const workspaceFs = createLocalFileSystem();
const workspaceStoragePath = join(userDataPath, "workspaces.json");
const workspaceStorage = createJsonStorageAdapter<PersistedWorkspaceState>(
  workspaceStoragePath,
  workspaceFs
);
const workspaceSettingsRepo = new WorkspaceSettingsRepository(workspaceStorage);
const workspaceRegistry = new WorkspaceRegistry(workspaceSettingsRepo, workspaceFs);
const workspaceService = createWorkspaceService(workspaceRegistry, workspaceFs, { userDataPath });

// ─── Explorer Infrastructure ───────────────────────────────────────────────────

const explorerEventBus = new ExplorerEventBus();
const treeModel = new TreeModel();
const explorerService = new ExplorerService(treeModel, explorerEventBus);
const explorerFs = new LocalVirtualFileSystem();

// ─── Document & Editor Infrastructure ──────────────────────────────────────────

const documentService = new DocumentService(workspaceFs);
const editorService = new EditorService();
const commandRegistry = new CommandRegistry();
commandRegistry.registerCommand(new SaveDocumentCommand(documentService));

// ─── Application Lifecycle ────────────────────────────────────────────────────

app.whenReady().then(async () => {
  logger.info("Open-Code.Studio starting", { version: app.getVersion() });

  // Initialize workspace service (loads registry)
  await workspaceService.initialize();

  // Initialise platform services
  container.singleton(Symbol.for("logger"), () => logger);
  container.singleton(Symbol.for("lifecycle"), () => lifecycle);
  container.singleton(Symbol.for("workspace.fs"), () => workspaceFs);
  container.singleton(Symbol.for("explorer.fs"), () => explorerFs);
  container.singleton(Symbol.for("explorer.events"), () => explorerEventBus);
  container.singleton(Symbol.for("explorer.tree"), () => treeModel);
  container.singleton(Symbol.for("workspace"), () => workspaceService);
  container.singleton(Symbol.for("explorer"), () => explorerService);
  container.singleton(Symbol.for("document"), () => documentService);
  container.singleton(Symbol.for("editor"), () => editorService);
  container.singleton(Symbol.for("commands"), () => commandRegistry);

  // Register providers (Workspace is the primary one)
  const workspaceProvider = new WorkspaceProvider(
    container.resolve<LocalVirtualFileSystem>(Symbol.for("explorer.fs"))
  );
  container.singleton(Symbol.for("explorer.provider.workspace"), () => workspaceProvider);
  explorerService.registerProvider(workspaceProvider);

  // Register IPC handlers before any window opens
  registerIpcHandlers(container);

  // Restore previous workspace session if available
  const restored = await restoreLastWorkspace(container);
  if (restored) {
    logger.info("Restored previous workspace session");
  }

  // Build native menu
  createApplicationMenu();

  // Create main window
  windowManager = createWindowManager(logger);
  windowManager.createMainWindow();

  logger.info("Desktop host ready");

  app.on("activate", () => {
    // macOS: re-create window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // On macOS, keep the process alive when all windows are closed
  if (process.platform !== "darwin") {
    logger.info("All windows closed — quitting");
    app.quit();
  }
});

app.on("before-quit", async () => {
  logger.info("Application shutting down");
  await lifecycle.stop();
});

// Security: block navigation to external URLs
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, url) => {
    const { origin } = new URL(url);
    if (origin !== "http://localhost:5173" && !url.startsWith("file://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});

export { container, lifecycle, logger };
