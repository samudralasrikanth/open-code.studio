/**
 * WorkspaceSettingsRepository — persists workspace registry state.
 *
 * Stores the active workspace ID and the recent workspaces list
 * to the user data directory via an IStorageAdapter.
 *
 * This is the persistence layer only. Business logic (max list size,
 * pruning, pinning) lives in WorkspaceRegistry.
 */

import type { RecentWorkspace } from "../domain/WorkspaceMetadata.js";
import type { IStorageAdapter } from "../infrastructure/IStorageAdapter.js";

export interface PersistedWorkspaceState {
  readonly version: 1;
  readonly activeWorkspaceId: string | undefined;
  readonly recent: readonly RecentWorkspaceDto[];
}

interface RecentWorkspaceDto {
  readonly id: string;
  readonly uri: string;
  readonly displayName: string;
  readonly type: string;
  readonly lastOpenedAt: string; // ISO-8601
  readonly pinned: boolean;
}

export class WorkspaceSettingsRepository {
  public constructor(private readonly adapter: IStorageAdapter<PersistedWorkspaceState>) {}

  public async load(): Promise<PersistedWorkspaceState | undefined> {
    const raw = await this.adapter.load();
    if (!raw || raw.version !== 1) return undefined;
    return raw;
  }

  public async save(
    activeId: string | undefined,
    recent: readonly RecentWorkspace[]
  ): Promise<void> {
    const dto: PersistedWorkspaceState = {
      version: 1,
      activeWorkspaceId: activeId,
      recent: recent.map((r) => ({
        id: r.id,
        uri: r.uri,
        displayName: r.displayName,
        type: r.type,
        lastOpenedAt: r.lastOpenedAt.toISOString(),
        pinned: r.pinned
      }))
    };
    await this.adapter.save(dto);
  }

  public async clear(): Promise<void> {
    await this.adapter.clear();
  }

  /** Deserialise a DTO back into a RecentWorkspace domain object. */
  public static recentFromDto(dto: RecentWorkspaceDto): RecentWorkspace {
    return {
      id: dto.id,
      uri: dto.uri as RecentWorkspace["uri"],
      displayName: dto.displayName,
      type: dto.type as RecentWorkspace["type"],
      lastOpenedAt: new Date(dto.lastOpenedAt),
      pinned: dto.pinned
    };
  }
}
