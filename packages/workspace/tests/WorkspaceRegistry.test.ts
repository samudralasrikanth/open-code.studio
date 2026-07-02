import { describe, expect, it, vi } from "vitest";

import { WorkspaceRegistry } from "../src/application/WorkspaceRegistry.js";
import { WorkspaceSettingsRepository } from "../src/application/WorkspaceSettingsRepository.js";
import type { PersistedWorkspaceState } from "../src/application/WorkspaceSettingsRepository.js";
import { uriFromPath } from "../src/domain/WorkspaceUri.js";
import type { IFileSystem } from "../src/infrastructure/IFileSystem.js";
import type { IStorageAdapter } from "../src/infrastructure/IStorageAdapter.js";

function makeFs(existingPaths: Set<string> = new Set()): IFileSystem {
  return {
    stat: vi.fn(),
    exists: vi.fn((p: string) => Promise.resolve(existingPaths.has(p))),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    join: (...s: string[]) => s.join("/")
  };
}

function makeAdapter(initial?: PersistedWorkspaceState): IStorageAdapter<PersistedWorkspaceState> {
  let stored = initial;
  return {
    load: vi.fn(() => Promise.resolve(stored)),
    save: vi.fn((v: PersistedWorkspaceState) => {
      stored = v;
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      stored = undefined;
      return Promise.resolve();
    })
  };
}

function makeRegistry(fs: IFileSystem, adapter: IStorageAdapter<PersistedWorkspaceState>, max = 5) {
  const repo = new WorkspaceSettingsRepository(adapter);
  return new WorkspaceRegistry(repo, fs, { maxRecentWorkspaces: max });
}

describe("WorkspaceRegistry", () => {
  it("starts empty when no persisted state", async () => {
    const reg = makeRegistry(makeFs(), makeAdapter());
    await reg.load();
    expect(reg.getAll()).toHaveLength(0);
  });

  it("records an opened workspace", async () => {
    const fs = makeFs(new Set(["/project"]));
    const reg = makeRegistry(fs, makeAdapter());
    await reg.load();

    const uri = uriFromPath("/project");
    await reg.recordOpened(uri, "local");
    expect(reg.getAll()).toHaveLength(1);
    expect(reg.getAll()[0]?.uri).toBe(uri);
  });

  it("deduplicates by URI — most recent wins", async () => {
    const fs = makeFs(new Set(["/project"]));
    const reg = makeRegistry(fs, makeAdapter());
    await reg.load();

    const uri = uriFromPath("/project");
    await reg.recordOpened(uri, "local", "First");
    await reg.recordOpened(uri, "local", "Second");

    expect(reg.getAll()).toHaveLength(1);
    expect(reg.getAll()[0]?.displayName).toBe("Second");
  });

  it("evicts oldest unpinned when max is exceeded", async () => {
    const fs = makeFs();
    const reg = makeRegistry(fs, makeAdapter(), 3);
    await reg.load();

    for (let i = 0; i < 5; i++) {
      await reg.recordOpened(uriFromPath(`/project-${i}`), "local");
    }

    expect(reg.getAll()).toHaveLength(3);
  });

  it("never evicts pinned entries", async () => {
    const fs = makeFs(new Set(["/pinned", "/p1", "/p2", "/p3"]));
    const reg = makeRegistry(fs, makeAdapter(), 2);
    await reg.load();

    const pinnedUri = uriFromPath("/pinned");
    await reg.recordOpened(pinnedUri, "local", "Pinned");
    const pinned = reg.findByUri(pinnedUri);
    if (pinned) await reg.pin(pinned.id, true);

    // Add two more to fill up to max
    await reg.recordOpened(uriFromPath("/p1"), "local");
    await reg.recordOpened(uriFromPath("/p2"), "local");
    // Should evict unpinned but keep pinned
    await reg.recordOpened(uriFromPath("/p3"), "local");

    const all = reg.getAll();
    expect(all.some((r) => r.uri === pinnedUri)).toBe(true);
  });

  it("removes an entry by id", async () => {
    const fs = makeFs(new Set(["/project"]));
    const reg = makeRegistry(fs, makeAdapter());
    await reg.load();

    await reg.recordOpened(uriFromPath("/project"), "local");
    const id = reg.getAll()[0]!.id;
    await reg.remove(id);
    expect(reg.getAll()).toHaveLength(0);
  });

  it("prunes missing local folders on load", async () => {
    const existingUri = uriFromPath("/exists");
    const missingUri = uriFromPath("/missing");

    const adapter = makeAdapter({
      version: 1,
      activeWorkspaceId: undefined,
      recent: [
        {
          id: "a",
          uri: existingUri,
          displayName: "Exists",
          type: "local",
          lastOpenedAt: new Date().toISOString(),
          pinned: false
        },
        {
          id: "b",
          uri: missingUri,
          displayName: "Missing",
          type: "local",
          lastOpenedAt: new Date().toISOString(),
          pinned: false
        }
      ]
    } as unknown as PersistedWorkspaceState);

    const fs = makeFs(new Set(["/exists"]));
    const reg = makeRegistry(fs, adapter);
    await reg.load();

    expect(reg.getAll()).toHaveLength(1);
    expect(reg.getAll()[0]?.uri).toBe(existingUri);
  });
});
