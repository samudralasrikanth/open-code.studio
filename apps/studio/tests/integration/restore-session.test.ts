/* eslint-disable */
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createContainer, createLogger } from "@ocs/common";
import { EventBus } from "@ocs/common/events";
import {
  ExplorerService,
  TreeModel,
  ExplorerEventBus,
  LocalVirtualFileSystem
} from "@ocs/explorer";
import { WorkspaceProvider } from "@ocs/explorer";
import { createLocalFileSystem, createJsonStorageAdapter, uriFromPath } from "@ocs/workspace";
import {
  createWorkspaceService,
  WorkspaceRegistry,
  WorkspaceSettingsRepository,
  type PersistedWorkspaceState
} from "@ocs/workspace/application";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { restoreLastWorkspace } from "../../src/main/ipc/handlers/workspace/index";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn()
  },
  webContents: {
    getAllWebContents: vi.fn(() => [])
  }
}));

describe("Integration: Restore Session", () => {
  let container: import("@ocs/common").Container;
  let tempDir: string;
  let workspaceDir: string;
  let fs: any;
  let workspaceService: any;
  let explorerService: any;

  beforeEach(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "ocs-integration-restore-"));
    workspaceDir = join(tempDir, "workspace");
    mkdirSync(workspaceDir);

    container = createContainer();
    const logger = createLogger({ level: "error" });

    logger.flow = vi.fn();
    logger.warn = vi.fn((msg, data) => console.log("WARN:", msg, data));
    logger.error = vi.fn((msg, data) => console.log("ERROR:", msg, data));

    container.singleton(Symbol.for("logger"), () => logger);

    // 1. Setup Workspace Service
    fs = createLocalFileSystem();
    const storagePath = join(tempDir, "workspaces.json");
    const storage = createJsonStorageAdapter<PersistedWorkspaceState>(storagePath, fs);
    const settingsRepo = new WorkspaceSettingsRepository(storage);
    const registry = new WorkspaceRegistry(settingsRepo, fs);
    const eventBus = new EventBus();

    workspaceService = createWorkspaceService(registry, fs, { userDataPath: tempDir }, eventBus);
    await workspaceService.initialize();
    container.singleton(Symbol.for("workspace"), () => workspaceService);

    // 2. Setup Explorer Service
    const treeModel = new TreeModel();
    const explorerEventBus = new ExplorerEventBus();
    explorerService = new ExplorerService(treeModel, explorerEventBus);

    // Register the WorkspaceProvider
    const vfs = new LocalVirtualFileSystem();
    const provider = new WorkspaceProvider(vfs);
    explorerService.registerProvider(provider);

    container.singleton(Symbol.for("explorer"), () => explorerService);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("should restore the last opened workspace", async () => {
    // 1. First open the workspace so it is saved as recent/last opened
    await workspaceService.open(workspaceDir);
    expect(workspaceService.getLastOpenedUri()?.toString()).toBe(
      uriFromPath(workspaceDir).toString()
    );

    // 2. Simulate closing / shutdown by un-setting current workspace but keeping state
    // We'll directly call close, which updates state.
    await workspaceService.close();
    expect(workspaceService.getActive()).toBeNull();
    // But wait, closing clears active but might not clear last opened.
    // In current implementation, lastOpenedUri is preserved.
    expect(workspaceService.getLastOpenedUri()?.toString()).toBe(
      uriFromPath(workspaceDir).toString()
    );

    // 3. Now test restoreLastWorkspace
    const restored = await restoreLastWorkspace(container);

    expect(restored).toBe(true);
    expect(workspaceService.getActive()?.uri.toString()).toBe(uriFromPath(workspaceDir).toString());
    expect(explorerService.treeModel.getRootId()).toBe(uriFromPath(workspaceDir).toString());
  });

  it("should return false if there is no last opened workspace", async () => {
    // Ensure no workspace was opened
    expect(workspaceService.getLastOpenedUri()).toBeNull();

    const restored = await restoreLastWorkspace(container);
    expect(restored).toBe(false);
  });
});
