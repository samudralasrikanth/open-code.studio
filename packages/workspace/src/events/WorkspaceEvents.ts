/**
 * WorkspaceEvents — typed event constants and payload interfaces.
 *
 * All workspace lifecycle events are published on the EventBus.
 * Consumers subscribe by event type string. Payload types are declared here
 * so TypeScript enforces payload shapes at subscription sites.
 *
 * Event sequence for a successful open:
 *   workspace.opening → workspace.opened
 *
 * Event sequence for a failed open:
 *   workspace.opening → workspace.failed
 */

import type { Workspace, RecentWorkspace } from "../domain/WorkspaceMetadata.js";
import type { WorkspaceStateValue } from "../domain/WorkspaceState.js";
import type { WorkspaceUri } from "../domain/WorkspaceUri.js";

// ── Event type constants ───────────────────────────────────────────────────────

export const WorkspaceEventTypes = {
  /** Fired immediately when open() is called, before validation. */
  OPENING: "workspace.opening",
  /** Fired when the workspace is fully validated and ready. */
  OPENED: "workspace.opened",
  /** Fired when close() completes successfully. */
  CLOSED: "workspace.closed",
  /** Fired when an open() attempt fails. */
  FAILED: "workspace.failed",
  /** Fired on every state transition. */
  STATE_CHANGED: "workspace.state-changed",
  /** Fired when the recent workspace list changes. */
  RECENT_UPDATED: "workspace.recent-updated"
} as const;

export type WorkspaceEventType = (typeof WorkspaceEventTypes)[keyof typeof WorkspaceEventTypes];

// ── Event payload types ────────────────────────────────────────────────────────

export interface WorkspaceOpeningPayload {
  readonly uri: WorkspaceUri;
}

export interface WorkspaceOpenedPayload {
  readonly workspace: Workspace;
}

export interface WorkspaceClosedPayload {
  readonly workspaceId: string;
  readonly uri: WorkspaceUri;
}

export interface WorkspaceFailedPayload {
  readonly uri: WorkspaceUri;
  readonly errorCode: string;
  readonly errorMessage: string;
}

export interface WorkspaceStateChangedPayload {
  readonly workspaceId: string | undefined;
  readonly from: WorkspaceStateValue;
  readonly to: WorkspaceStateValue;
}

export interface WorkspaceRecentUpdatedPayload {
  readonly recent: readonly RecentWorkspace[];
}
