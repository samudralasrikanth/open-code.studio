/* eslint-disable */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { EventBus } from "@ocs/common/events";
import { createLocalFileSystem, createJsonStorageAdapter } from "@ocs/workspace";
import { WorkspaceEventTypes } from "@ocs/workspace";
import {
  createWorkspaceService,
  WorkspaceRegistry,
  WorkspaceSettingsRepository,
  type PersistedWorkspaceState
} from "@ocs/workspace/application";
import { describe, expect, it, beforeEach, vi } from "vitest";

describe("Integration: Workspace Open", () => {
  let tempDir: string;
  let workspaceService: ReturnType<typeof createWorkspaceService>;
  let registry: WorkspaceRegistry;
  let eventBus: EventBus;
  let fs: ReturnType<typeof createLocalFileSystem>;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "ocs-integration-test-"));
    fs = createLocalFileSystem();
    const storagePath = join(tempDir, "workspaces.json");
    const storage = createJsonStorageAdapter<PersistedWorkspaceState>(storagePath, fs);
    const settingsRepo = new WorkspaceSettingsRepository(storage);
    registry = new WorkspaceRegistry(settingsRepo, fs);
    eventBus = new EventBus();

    workspaceService = createWorkspaceService(registry, fs, { userDataPath: tempDir }, eventBus);
  });

  it("should successfully open a workspace and emit events", async () => {
    const openedEvents: any[] = [];
    eventBus.subscribe(WorkspaceEventTypes.OPENED, (data) => openedEvents.push(data));

    const ws = await workspaceService.open(tempDir);

    expect(ws).toBeDefined();
    expect(ws.uri.toString()).toBe(`file://${tempDir}`);
    expect(workspaceService.getActive()).toBe(ws);
    expect(workspaceService.isOpen()).toBe(true);

    expect(openedEvents).toHaveLength(1);
    expect(openedEvents[0].payload.workspace.id).toBe(ws.id);
  });

  it("should fail to open an invalid workspace", async () => {
    const invalidPath = join(tempDir, "does-not-exist");

    await expect(workspaceService.open(invalidPath)).rejects.toThrow();

    expect(workspaceService.getActive()).toBeNull();
    expect(workspaceService.isOpen()).toBe(false);
  });
});
