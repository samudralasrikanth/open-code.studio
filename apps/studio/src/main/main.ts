/* eslint-disable */
import { join } from "path";

import { createContainer } from "@ocs/common";
import { createLifecycleManager } from "@ocs/common";
import { createLogger } from "@ocs/common";
import {
  createLocalFileSystem,
  createJsonStorageAdapter,
  WorkspaceSettingsRepository,
  WorkspaceRegistry,
  createWorkspaceService,
  PersistedWorkspaceState
} from "@ocs/workspace";
import { ExplorerService, TreeModel, ExplorerEventBus, WorkspaceProvider } from "@ocs/explorer";
import { app, BrowserWindow, shell } from "electron";

import { registerIpcHandlers } from "./ipc/handlers.js";
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

// ─── Application Lifecycle ────────────────────────────────────────────────────

app.whenReady().then(async () => {
  logger.info("Open-Code.Studio starting", { version: app.getVersion() });

  // Initialize workspace service (loads registry)
  await workspaceService.initialize();

  // Initialise platform services
  container.singleton(Symbol.for("logger"), () => logger);
  container.singleton(Symbol.for("lifecycle"), () => lifecycle);
  container.singleton(Symbol.for("workspace"), () => workspaceService);
  container.singleton(Symbol.for("explorer"), () => explorerService);

  // Register providers (Workspace is the primary one)
  const workspaceProvider = new WorkspaceProvider(workspaceFs);
  explorerService.registerProvider(workspaceProvider);

  // Register IPC handlers before any window opens
  registerIpcHandlers(container);

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
