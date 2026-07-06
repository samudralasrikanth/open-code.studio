/* eslint-disable */
/**
 * WorkspaceService — workspace lifecycle orchestrator.
 *
 * Responsibilities:
 *   - open()    Validate + load metadata → publish events → return Workspace
 *   - close()   Release workspace → publish events
 *   - reload()  Close + reopen the same URI
 *   - dispose() Clean shutdown
 *
 * Constraints:
 *   - No Electron imports. Zero.
 *   - No direct fs calls. All via IFileSystem.
 *   - Opening = context only. No file scanning.
 *   - Event bus is optional — WorkspaceService works without one.
 */

import { randomUUID } from "node:crypto";

import { PlatformError } from "@ocs/common/errors";
import type { EventBus } from "@ocs/common/events";

import type { RecentWorkspace, Workspace } from "../domain/WorkspaceMetadata.js";
import { WorkspaceStateMachine } from "../domain/WorkspaceState.js";
import { uriDisplayName, uriFromPath, uriToPath } from "../domain/WorkspaceUri.js";
import { ImmutableWorkspaceTree } from "../domain/WorkspaceTree.js";
import type { WorkspaceTree } from "../domain/WorkspaceTree.js";
import { URI } from "@ocs/common";
import { WorkspaceEventTypes } from "../events/WorkspaceEvents.js";
import type { IFileSystem } from "../infrastructure/IFileSystem.js";

import { WorkspaceConfiguration } from "./WorkspaceConfiguration.js";
import type { WorkspaceRegistry } from "./WorkspaceRegistry.js";

export interface WorkspaceServiceOptions {
  readonly userDataPath: string;
  readonly maxRecentWorkspaces?: number;
}

export class WorkspaceService {
  private _workspace: Workspace | null = null;
  private _tree: WorkspaceTree = new ImmutableWorkspaceTree([]);
  private readonly state = new WorkspaceStateMachine();
  private readonly wsConfig: WorkspaceConfiguration;

  public constructor(
    private readonly registry: WorkspaceRegistry,
    private readonly fs: IFileSystem,
    _options: WorkspaceServiceOptions,
    private readonly events?: EventBus
  ) {
    this.wsConfig = new WorkspaceConfiguration(fs);
  }

  // ── Queries ─────────────────────────────────────────────────────────────────

  public getActive(): Workspace | null {
    return this._workspace;
  }

  public getTree(): WorkspaceTree {
    return this._tree;
  }

  public addRoot(uri: URI): void {
    const newRoots = [...this._tree.roots];
    if (!newRoots.find((r) => r.uri.toString() === uri.toString())) {
      newRoots.push({
        uri,
        name: uri.path.split("/").pop() || "",
        isDirectory: true
      });
      this._tree = new ImmutableWorkspaceTree(newRoots);
    }
  }

  public removeRoot(uri: URI): void {
    const newRoots = this._tree.roots.filter((r) => r.uri.toString() !== uri.toString());
    this._tree = new ImmutableWorkspaceTree(newRoots);
  }

  public isOpen(): boolean {
    return this.state.is("open");
  }

  public getRecent(): readonly RecentWorkspace[] {
    return this.registry.getAll();
  }

  public getLastOpenedUri(): import("../domain/WorkspaceUri.js").WorkspaceUri | null {
    return this.registry.getLastOpenedUri();
  }

  public async removeRecent(id: string): Promise<void> {
    await this.registry.remove(id);
    await this.events?.publish(WorkspaceEventTypes.RECENT_UPDATED, {
      recent: this.registry.getAll()
    });
  }

  public async updateSettings(settings: Record<string, unknown>): Promise<void> {
    if (!this._workspace) return;
    const current = this._workspace;
    const newConfig = {
      ...current.configuration,
      settings: {
        ...current.configuration.settings,
        ...settings
      }
    };

    const path = uriToPath(current.uri);
    await this.wsConfig.write(path, newConfig);

    this._workspace = {
      ...current,
      configuration: newConfig
    };
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  /**
   * Open a workspace at the given absolute path.
   *
   * Sequence:
   *   1. Transition: closed → opening
   *   2. Publish workspace.opening
   *   3. Validate folder exists and is readable
   *   4. Load .ocs/workspace.json (ignored if absent/corrupt)
   *   5. Transition: opening → open
   *   6. Publish workspace.opened
   *   7. Record in recent workspaces
   */
  public async open(absolutePath: string): Promise<Workspace> {
    if (!this.state.is("closed") && !this.state.is("failed")) {
      throw new PlatformError({
        category: "workspace",
        code: "OCS-WS-001",
        message: "Cannot open a workspace while another is active. Close first.",
        recoverable: true
      });
    }

    const uri = uriFromPath(absolutePath);
    const previousState = this.state.value;
    this.state.transition("opening");

    await this.publishStateChanged(previousState, "opening", undefined);
    await this.events?.publish(WorkspaceEventTypes.OPENING, { uri });

    try {
      // ── Step 1: Validate ──────────────────────────────────────────────────
      const folderStat = await this.fs.stat(absolutePath).catch(() => {
        throw new PlatformError({
          category: "workspace",
          code: "OCS-WS-002",
          message: `Folder not found or not accessible: ${absolutePath}`,
          recoverable: true
        });
      });

      if (!folderStat.isDirectory) {
        throw new PlatformError({
          category: "workspace",
          code: "OCS-WS-003",
          message: `Path is not a directory: ${absolutePath}`,
          recoverable: true
        });
      }

      // ── Step 2: Load metadata ─────────────────────────────────────────────
      const { config, found } = await this.wsConfig.read(absolutePath);
      const displayName = config.name ?? uriDisplayName(uri);

      const workspace: Workspace = {
        id: randomUUID(),
        type: "local",
        uri,
        displayName,
        state: "open",
        openedAt: new Date(),
        metadata: {
          fsPath: absolutePath,
          createdAt: new Date(folderStat.mtimeMs),
          hasConfiguration: found
        },
        configuration: config
      };

      // ── Step 3: Transition → open ─────────────────────────────────────────
      this.state.transition("open");
      this._workspace = workspace;
      this._tree = new ImmutableWorkspaceTree([]);
      this.addRoot(URI.parse(uri));

      await this.publishStateChanged("opening", "open", workspace.id);
      await this.events?.publish(WorkspaceEventTypes.OPENED, { workspace });

      // ── Step 4: Record in recent ──────────────────────────────────────────
      await this.registry.recordOpened(uri, "local", displayName);
      await this.events?.publish(WorkspaceEventTypes.RECENT_UPDATED, {
        recent: this.registry.getAll()
      });

      return workspace;
    } catch (error) {
      this.state.transition("failed");
      this._workspace = null;

      const code = error instanceof PlatformError ? error.code : "OCS-WS-UNKNOWN";
      const message = error instanceof Error ? error.message : "Unknown workspace error";

      await this.publishStateChanged("opening", "failed", undefined);
      await this.events?.publish(WorkspaceEventTypes.FAILED, {
        uri,
        errorCode: code,
        errorMessage: message
      });

      throw error;
    }
  }

  /**
   * Close the active workspace.
   */
  public async close(): Promise<void> {
    if (!this.state.is("open")) return;

    const workspace = this._workspace;
    const previousState = this.state.value;
    this.state.transition("closing");
    await this.publishStateChanged(previousState, "closing", workspace?.id);

    this._workspace = null;
    this._tree = new ImmutableWorkspaceTree([]);
    this.state.transition("closed");

    await this.publishStateChanged("closing", "closed", workspace?.id);
    if (workspace) {
      await this.events?.publish(WorkspaceEventTypes.CLOSED, {
        workspaceId: workspace.id,
        uri: workspace.uri
      });
    }
  }

  /**
   * Reload the current workspace (close + reopen the same path).
   */
  public async reload(): Promise<Workspace> {
    const current = this._workspace;
    if (!current) {
      throw new PlatformError({
        category: "workspace",
        code: "OCS-WS-004",
        message: "No active workspace to reload.",
        recoverable: true
      });
    }
    const path = uriToPath(current.uri);
    await this.close();
    return this.open(path);
  }

  /**
   * Release all resources. Called during application shutdown.
   */
  public async dispose(): Promise<void> {
    await this.close();
  }

  // ── Initialisation ──────────────────────────────────────────────────────────

  /**
   * Load persisted state and restore the previous workspace if one exists.
   * Called once during Desktop Host startup.
   */
  public async initialize(): Promise<void> {
    await this.registry.load();
    // Active workspace restoration happens via the Desktop Host reading
    // the last opened path from the registry and calling open() explicitly.
    // WorkspaceService does not self-restore — that keeps startup control
    // in the host layer.
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async publishStateChanged(
    from: WorkspaceStateMachine["value"],
    to: WorkspaceStateMachine["value"],
    workspaceId: string | undefined
  ): Promise<void> {
    await this.events?.publish(WorkspaceEventTypes.STATE_CHANGED, {
      workspaceId,
      from,
      to
    });
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createWorkspaceService(
  registry: WorkspaceRegistry,
  fs: IFileSystem,
  options: WorkspaceServiceOptions,
  events?: EventBus
): WorkspaceService {
  return new WorkspaceService(registry, fs, options, events);
}
