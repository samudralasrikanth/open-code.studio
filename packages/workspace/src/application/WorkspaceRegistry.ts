/**
 * WorkspaceRegistry — manages the recent workspaces list.
 *
 * Business rules:
 *   - Maximum entries is configurable (defaults to 20)
 *   - Pinned workspaces are never auto-evicted
 *   - Unpinned entries sorted by lastOpenedAt descending
 *   - Missing folders are silently pruned on load
 *   - Duplicate URIs are deduplicated (most recent wins)
 */

import { randomUUID } from "node:crypto";

import type { RecentWorkspace, WorkspaceType } from "../domain/WorkspaceMetadata.js";
import type { WorkspaceUri } from "../domain/WorkspaceUri.js";
import { uriDisplayName } from "../domain/WorkspaceUri.js";
import type { IFileSystem } from "../infrastructure/IFileSystem.js";

import { WorkspaceSettingsRepository } from "./WorkspaceSettingsRepository.js";

export interface WorkspaceRegistryOptions {
  readonly maxRecentWorkspaces?: number;
}

const DEFAULT_MAX = 20;

export class WorkspaceRegistry {
  private recent: RecentWorkspace[] = [];
  private lastOpenedUri: WorkspaceUri | null = null;
  private readonly max: number;

  public constructor(
    private readonly repo: WorkspaceSettingsRepository,
    private readonly fs: IFileSystem,
    options: WorkspaceRegistryOptions = {}
  ) {
    this.max = options.maxRecentWorkspaces ?? DEFAULT_MAX;
  }

  // ── Initialisation ──────────────────────────────────────────────────────────

  public async load(): Promise<void> {
    const state = await this.repo.load();
    if (!state) {
      this.recent = [];
      this.lastOpenedUri = null;
      return;
    }
    const deserialized = state.recent.map((dto) => WorkspaceSettingsRepository.recentFromDto(dto));
    this.recent = await this.pruneMissing(deserialized);
    this.lastOpenedUri = (state.activeWorkspaceId as WorkspaceUri | undefined) ?? null;
  }

  // ── Queries ─────────────────────────────────────────────────────────────────

  public getAll(): readonly RecentWorkspace[] {
    return this.sorted();
  }

  /** URI of the last opened workspace, used for session restore. */
  public getLastOpenedUri(): WorkspaceUri | null {
    if (this.lastOpenedUri) {
      const exists = this.recent.some((r) => r.uri === this.lastOpenedUri);
      if (exists) return this.lastOpenedUri;
    }
    return this.sorted()[0]?.uri ?? null;
  }

  public findById(id: string): RecentWorkspace | undefined {
    return this.recent.find((r) => r.id === id);
  }

  public findByUri(uri: WorkspaceUri): RecentWorkspace | undefined {
    return this.recent.find((r) => r.uri === uri);
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  public async recordOpened(
    uri: WorkspaceUri,
    type: WorkspaceType,
    displayNameOverride?: string
  ): Promise<RecentWorkspace> {
    // Deduplicate: remove any existing entry for this URI
    this.recent = this.recent.filter((r) => r.uri !== uri);

    const entry: RecentWorkspace = {
      id: randomUUID(),
      uri,
      displayName: displayNameOverride ?? uriDisplayName(uri),
      type,
      lastOpenedAt: new Date(),
      pinned: false
    };

    this.recent.unshift(entry);
    this.lastOpenedUri = uri;
    this.evict();
    await this.persist();
    return entry;
  }

  public async remove(id: string): Promise<void> {
    this.recent = this.recent.filter((r) => r.id !== id);
    await this.persist();
  }

  public async pin(id: string, pinned: boolean): Promise<void> {
    this.recent = this.recent.map((r) => (r.id === id ? { ...r, pinned } : r));
    await this.persist();
  }

  public async clear(): Promise<void> {
    this.recent = [];
    await this.repo.clear();
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private sorted(): RecentWorkspace[] {
    const pinned = this.recent
      .filter((r) => r.pinned)
      .sort((a, b) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime());
    const unpinned = this.recent
      .filter((r) => !r.pinned)
      .sort((a, b) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime());
    return [...pinned, ...unpinned];
  }

  private evict(): void {
    // Never evict pinned entries. Evict oldest unpinned beyond the max.
    const pinned = this.recent.filter((r) => r.pinned);
    const unpinned = this.recent
      .filter((r) => !r.pinned)
      .sort((a, b) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime())
      .slice(0, Math.max(0, this.max - pinned.length));
    this.recent = [...pinned, ...unpinned];
  }

  private async pruneMissing(entries: RecentWorkspace[]): Promise<RecentWorkspace[]> {
    const results = await Promise.all(
      entries.map(async (entry) => {
        if (!entry.uri.startsWith("file://")) return entry; // non-local — keep
        const path = entry.uri.slice("file://".length);
        const ok = await this.fs.exists(path);
        return ok ? entry : null;
      })
    );
    return results.filter((e): e is RecentWorkspace => e !== null);
  }

  private async persist(): Promise<void> {
    await this.repo.save(this.lastOpenedUri ?? undefined, this.sorted());
  }
}
