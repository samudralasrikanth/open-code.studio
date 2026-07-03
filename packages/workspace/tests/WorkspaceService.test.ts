import { describe, expect, it, vi } from "vitest";

import { WorkspaceRegistry } from "../src/application/WorkspaceRegistry.js";
import { WorkspaceService } from "../src/application/WorkspaceService.js";
import { WorkspaceSettingsRepository } from "../src/application/WorkspaceSettingsRepository.js";
import type { PersistedWorkspaceState } from "../src/application/WorkspaceSettingsRepository.js";
import { uriFromPath } from "../src/domain/WorkspaceUri.js";
import type { IFileSystem, StatResult } from "../src/infrastructure/IFileSystem.js";
import type { IStorageAdapter } from "../src/infrastructure/IStorageAdapter.js";

const FOLDER = "/home/dev/project";
const DIR_STAT: StatResult = {
  isDirectory: true,
  isFile: false,
  sizeBytes: 0,
  mtimeMs: Date.now()
};

function makeFs(overrides: Partial<IFileSystem> = {}): IFileSystem {
  return {
    stat: vi.fn(() => Promise.resolve(DIR_STAT)),
    exists: vi.fn((p: string) =>
      Promise.resolve(p === FOLDER || p.endsWith(".ocs/workspace.json") === false)
    ),
    readFile: vi.fn(() => Promise.resolve("{}")),
    writeFile: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    join: (...s: string[]) => s.join("/"),
    ...overrides
  };
}

function makeService(fsOverrides: Partial<IFileSystem> = {}) {
  const fs = makeFs(fsOverrides);
  const adapter: IStorageAdapter<PersistedWorkspaceState> = {
    load: vi.fn(() => Promise.resolve(undefined)),
    save: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve())
  };
  const repo = new WorkspaceSettingsRepository(adapter);
  const registry = new WorkspaceRegistry(repo, fs);
  const service = new WorkspaceService(registry, fs, {
    userDataPath: "/home/.ocs"
  });
  return { service, registry, fs };
}

describe("WorkspaceService", () => {
  describe("open()", () => {
    it("returns a workspace for a valid directory", async () => {
      const { service } = makeService();
      await service.initialize();
      const ws = await service.open(FOLDER);

      expect(ws.type).toBe("local");
      expect(ws.state).toBe("open");
      expect(ws.uri).toBe(uriFromPath(FOLDER));
      expect(ws.metadata.fsPath).toBe(FOLDER);
    });

    it("transitions state to open", async () => {
      const { service } = makeService();
      await service.initialize();
      await service.open(FOLDER);
      expect(service.isOpen()).toBe(true);
    });

    it("throws OCS-WS-002 when folder does not exist", async () => {
      const { service } = makeService({
        stat: vi.fn(() => Promise.reject(new Error("ENOENT")))
      });
      await service.initialize();
      await expect(service.open(FOLDER)).rejects.toMatchObject({
        code: "OCS-WS-002"
      });
    });

    it("transitions to failed state on error", async () => {
      const { service } = makeService({
        stat: vi.fn(() => Promise.reject(new Error("ENOENT")))
      });
      await service.initialize();
      try {
        await service.open(FOLDER);
      } catch {
        // expected
      }
      // After failure the service is in failed state (closed after explicit reset)
      expect(service.isOpen()).toBe(false);
    });

    it("allows retrying open() on a valid folder after a failed attempt", async () => {
      const stat = vi
        .fn()
        .mockRejectedValueOnce(new Error("ENOENT"))
        .mockResolvedValueOnce(DIR_STAT);
      const { service } = makeService({ stat });
      await service.initialize();

      await expect(service.open(FOLDER)).rejects.toThrow();
      expect(service.isOpen()).toBe(false);

      const workspace = await service.open(FOLDER);
      expect(workspace).toBeDefined();
      expect(service.isOpen()).toBe(true);
    });

    it("throws OCS-WS-003 when path is a file not a directory", async () => {
      const { service } = makeService({
        stat: vi.fn(() =>
          Promise.resolve({ isDirectory: false, isFile: true, sizeBytes: 100, mtimeMs: Date.now() })
        )
      });
      await service.initialize();
      await expect(service.open(FOLDER)).rejects.toMatchObject({
        code: "OCS-WS-003"
      });
    });

    it("throws OCS-WS-001 when called while already open", async () => {
      const { service } = makeService();
      await service.initialize();
      await service.open(FOLDER);
      await expect(service.open("/other/folder")).rejects.toMatchObject({
        code: "OCS-WS-001"
      });
    });

    it("uses configuration name override as displayName", async () => {
      const { service } = makeService({
        exists: vi.fn(() => Promise.resolve(true)),
        readFile: vi.fn(() =>
          Promise.resolve(JSON.stringify({ name: "My Custom Name", schemaVersion: 1 }))
        )
      });
      await service.initialize();
      const ws = await service.open(FOLDER);
      expect(ws.displayName).toBe("My Custom Name");
    });
  });

  describe("close()", () => {
    it("closes an open workspace", async () => {
      const { service } = makeService();
      await service.initialize();
      await service.open(FOLDER);
      await service.close();
      expect(service.isOpen()).toBe(false);
      expect(service.getActive()).toBeNull();
    });

    it("is a no-op when no workspace is open", async () => {
      const { service } = makeService();
      await service.initialize();
      await expect(service.close()).resolves.toBeUndefined();
    });
  });

  describe("reload()", () => {
    it("reopens the same workspace", async () => {
      const { service } = makeService();
      await service.initialize();
      const original = await service.open(FOLDER);
      const reloaded = await service.reload();

      expect(reloaded.uri).toBe(original.uri);
      expect(reloaded.id).not.toBe(original.id); // new workspace object
    });

    it("throws OCS-WS-004 when no workspace is open", async () => {
      const { service } = makeService();
      await service.initialize();
      await expect(service.reload()).rejects.toMatchObject({
        code: "OCS-WS-004"
      });
    });
  });

  describe("getActive()", () => {
    it("returns null before opening", async () => {
      const { service } = makeService();
      await service.initialize();
      expect(service.getActive()).toBeNull();
    });

    it("returns the workspace after opening", async () => {
      const { service } = makeService();
      await service.initialize();
      await service.open(FOLDER);
      expect(service.getActive()).not.toBeNull();
    });

    it("returns null after closing", async () => {
      const { service } = makeService();
      await service.initialize();
      await service.open(FOLDER);
      await service.close();
      expect(service.getActive()).toBeNull();
    });
  });

  describe("events", () => {
    it("publishes workspace.opening and workspace.opened on success", async () => {
      const published: string[] = [];
      const events = {
        publish: vi.fn((type: string) => {
          published.push(type);
          return Promise.resolve({ id: "x", type, payload: {}, occurredAt: new Date() });
        }),
        subscribe: vi.fn(),
        getDeadLetters: vi.fn(() => [])
      };

      const fs = makeFs();
      const adapter: IStorageAdapter<PersistedWorkspaceState> = {
        load: vi.fn(() => Promise.resolve(undefined)),
        save: vi.fn(() => Promise.resolve()),
        clear: vi.fn(() => Promise.resolve())
      };
      const repo = new WorkspaceSettingsRepository(adapter);
      const registry = new WorkspaceRegistry(repo, fs);
      // @ts-expect-error — partial EventBus mock
      const service = new WorkspaceService(registry, fs, { userDataPath: "/tmp" }, events);
      await service.initialize();
      await service.open(FOLDER);

      expect(published).toContain("workspace.opening");
      expect(published).toContain("workspace.opened");
    });
  });
});
