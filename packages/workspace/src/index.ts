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
export { LocalFileSystem, createLocalFileSystem } from "./infrastructure/LocalFileSystem.js";
export type { IStorageAdapter } from "./infrastructure/IStorageAdapter.js";
export {
  JsonStorageAdapter,
  createJsonStorageAdapter
} from "./infrastructure/JsonStorageAdapter.js";

// Application
export { WorkspaceConfiguration as WorkspaceConfigurationReader } from "./application/WorkspaceConfiguration.js";
export { WorkspaceSettingsRepository } from "./application/WorkspaceSettingsRepository.js";
export type { PersistedWorkspaceState } from "./application/WorkspaceSettingsRepository.js";
export type { WorkspaceRegistryOptions } from "./application/WorkspaceRegistry.js";
export { WorkspaceRegistry } from "./application/WorkspaceRegistry.js";
export type { WorkspaceServiceOptions } from "./application/WorkspaceService.js";
export { WorkspaceService, createWorkspaceService } from "./application/WorkspaceService.js";
