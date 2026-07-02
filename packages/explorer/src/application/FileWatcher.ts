import type { WorkspaceUri } from "@ocs/workspace";

/**
 * Event types for filesystem events.
 */
export enum FileWatchEventType {
  Created = 1,
  Changed = 2,
  Deleted = 3
}

/**
 * Represents a single filesystem watch event.
 */
export interface FileWatchEvent {
  type: FileWatchEventType;
  uri: WorkspaceUri;
}

/**
 * Subscriber callback for file watch events.
 */
export type FileWatchCallback = (events: FileWatchEvent[]) => void;

/**
 * A generic abstraction for filesystem watching, avoiding direct Node.js ties.
 */
export interface IFileWatcher {
  /**
   * Starts watching the specified workspace root.
   */
  watch(root: WorkspaceUri, callback: FileWatchCallback): Promise<void>;

  /**
   * Stops watching the specified workspace root.
   */
  unwatch(root: WorkspaceUri): Promise<void>;

  /**
   * Cleans up all watchers and releases resources.
   */
  dispose(): Promise<void>;
}
