/**
 * @ocs/workspace — public API
 *
 * Import from '@ocs/workspace' only. Never import from internal paths.
 */

// Domain
export type { WorkspaceUri, WorkspaceScheme } from "./domain/WorkspaceUri.js";
export {
  uriFromPath,
  uriFromString,
  uriScheme,
  uriToPath,
  uriDisplayName,
  uriEquals
} from "./domain/WorkspaceUri.js";

export type {
  IWorkspaceContentIndexer,
  WorkspaceContentChangeEvent,
  WorkspaceFileEvent
} from "./domain/IWorkspaceContentIndexer.js";

export type { WorkspaceStateValue } from "./domain/WorkspaceState.js";
export { WorkspaceStateMachine } from "./domain/WorkspaceState.js";

export type {
  Workspace,
  WorkspaceType,
  WorkspaceMetadata,
  WorkspaceConfiguration,
  WorkspaceStatistics,
  RecentWorkspace
} from "./domain/WorkspaceMetadata.js";
export { DEFAULT_WORKSPACE_CONFIGURATION } from "./domain/WorkspaceMetadata.js";

// Events
export { WorkspaceEventTypes } from "./events/WorkspaceEvents.js";
export type {
  WorkspaceEventType,
  WorkspaceOpeningPayload,
  WorkspaceOpenedPayload,
  WorkspaceClosedPayload,
  WorkspaceFailedPayload,
  WorkspaceStateChangedPayload,
  WorkspaceRecentUpdatedPayload
} from "./events/WorkspaceEvents.js";

// Infrastructure
export type { IFileSystem, StatResult } from "./infrastructure/IFileSystem.js";
export type { IStorageAdapter } from "./infrastructure/IStorageAdapter.js";
export { LocalFileSystem, createLocalFileSystem } from "./infrastructure/LocalFileSystem.js";
export {
  JsonStorageAdapter,
  createJsonStorageAdapter
} from "./infrastructure/JsonStorageAdapter.js";

// Application (should be imported directly by main process)
export { WorkspaceService } from "./application/WorkspaceService.js";
export { ResourceService } from "./application/ResourceService.js";
export type { WorkspaceTree, WorkspaceNode } from "./domain/WorkspaceTree.js";
export { ImmutableWorkspaceTree } from "./domain/WorkspaceTree.js";
