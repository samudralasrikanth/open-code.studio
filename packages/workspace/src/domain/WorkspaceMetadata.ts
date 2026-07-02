/**
 * WorkspaceMetadata — separated model layers.
 *
 * Workspace   — identity + state (the core record)
 * WorkspaceMetadata — filesystem facts discovered at open time
 * WorkspaceConfiguration — user-controlled settings from .ocs/workspace.json
 * WorkspaceStatistics — computed facts (file count, size, languages, git branch)
 *                       populated by later epics via events
 */

import type { WorkspaceStateValue } from "./WorkspaceState.js";
import type { WorkspaceUri } from "./WorkspaceUri.js";

// ── Workspace types ───────────────────────────────────────────────────────────

/**
 * Discriminated union of supported workspace types.
 * Only 'local' is implemented. The rest are reserved for future epics.
 */
export type WorkspaceType =
  | "local" // Local file system folder — EPIC-0004
  | "remote" // SSH remote — reserved
  | "container" // Dev container — reserved
  | "cloud" // Cloud workspace — reserved
  | "readonly" // Read-only (e.g. archive) — reserved
  | "temporary"; // Temp folder (no persistence) — reserved

// ── Core Workspace ────────────────────────────────────────────────────────────

/** The canonical workspace record. Immutable after creation. */
export interface Workspace {
  readonly id: string;
  readonly type: WorkspaceType;
  readonly uri: WorkspaceUri;
  readonly displayName: string;
  readonly state: WorkspaceStateValue;
  readonly openedAt: Date;
  readonly metadata: WorkspaceMetadata;
  readonly configuration: WorkspaceConfiguration;
}

// ── WorkspaceMetadata ─────────────────────────────────────────────────────────

/**
 * Filesystem facts discovered at open time.
 * Populated during WorkspaceService.open(), never changed afterward.
 * Statistical facts (file count, languages, git branch) are added by later
 * epics via the WorkspaceStatistics type.
 */
export interface WorkspaceMetadata {
  /** Absolute file system path (for local workspaces). */
  readonly fsPath: string;
  /** When the folder was created (mtime of the directory). */
  readonly createdAt: Date | undefined;
  /** Whether a .ocs/workspace.json was found and loaded. */
  readonly hasConfiguration: boolean;
}

// ── WorkspaceConfiguration ────────────────────────────────────────────────────

/**
 * User-controlled settings sourced from `.ocs/workspace.json`.
 * Invalid values are silently replaced with defaults — never crash on open.
 */
export interface WorkspaceConfiguration {
  /** Human-readable name override (defaults to folder name). */
  readonly name: string | undefined;
  /** Folders included in a multi-root workspace. Reserved for future use. */
  readonly folders: readonly string[];
  /** Arbitrary extension settings keyed by extension ID. */
  readonly settings: Readonly<Record<string, unknown>>;
  /** Schema version — used for future migrations. */
  readonly schemaVersion: number;
}

export const DEFAULT_WORKSPACE_CONFIGURATION: WorkspaceConfiguration = {
  name: undefined,
  folders: [],
  settings: {},
  schemaVersion: 1
};

// ── WorkspaceStatistics ───────────────────────────────────────────────────────

/**
 * Computed facts about the workspace, populated asynchronously by later epics.
 * Never populated during WorkspaceService.open() — that would block startup.
 */
export interface WorkspaceStatistics {
  readonly totalFiles: number | undefined;
  readonly totalSizeBytes: number | undefined;
  readonly primaryLanguage: string | undefined;
  readonly gitBranch: string | undefined;
  readonly computedAt: Date | undefined;
}

// ── RecentWorkspace ────────────────────────────────────────────────────────────

/** A lightweight entry in the recent workspaces list. */
export interface RecentWorkspace {
  readonly id: string;
  readonly uri: WorkspaceUri;
  readonly displayName: string;
  readonly type: WorkspaceType;
  readonly lastOpenedAt: Date;
  readonly pinned: boolean;
}
