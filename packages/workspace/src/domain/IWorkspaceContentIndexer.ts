import type { WorkspaceUri } from "./WorkspaceUri.js";

/**
 * Event triggered when a file is modified.
 */
export interface WorkspaceContentChangeEvent {
  uri: WorkspaceUri;
  content: string; // The updated content, if available
}

/**
 * Event triggered when a file is created or deleted.
 */
export interface WorkspaceFileEvent {
  uri: WorkspaceUri;
  type: "created" | "deleted";
}

/**
 * Represents an indexer that analyzes and indexes workspace content.
 * Implementations could include Git, Search, AI, or Symbols indexers.
 */
export interface IWorkspaceContentIndexer {
  /**
   * Unique identifier for the indexer.
   */
  readonly id: string;

  /**
   * Called to index the entire workspace (usually on startup or full rebuild).
   */
  indexWorkspace(uri: WorkspaceUri): Promise<void>;

  /**
   * Called when a specific file's content changes.
   */
  onContentChanged(event: WorkspaceContentChangeEvent): Promise<void>;

  /**
   * Called when a file is created or deleted.
   */
  onFileEvent(event: WorkspaceFileEvent): Promise<void>;

  /**
   * Returns a status indicating indexing progress.
   */
  getStatus(): {
    isIndexing: boolean;
    progress: number;
    message?: string;
  };
}
