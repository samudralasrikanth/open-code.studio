import type { WorkspaceUri } from "@ocs/workspace";

export type DocumentType = "text" | "binary" | "custom";

export enum SaveState {
  Clean = "clean",
  Dirty = "dirty",
  Saving = "saving",
  SaveFailed = "saveFailed"
}

/**
 * Base document model that encapsulates content from a source (file, memory, etc.).
 * Documents are independent of Editors.
 */
export interface IDocument {
  /**
   * Unique identifier for this document, usually the URI string.
   */
  readonly id: string;

  /**
   * The URI this document represents.
   */
  readonly uri: WorkspaceUri;

  /**
   * The type of document this is.
   */
  readonly type: DocumentType;

  /**
   * Whether the document has unsaved changes.
   */
  readonly isDirty: boolean;

  /**
   * The current save state of this document.
   */
  readonly saveState: SaveState;

  /**
   * Whether the document can be modified.
   */
  readonly isReadonly: boolean;

  /**
   * Disposes of the document and releases associated resources.
   */
  dispose(): void;
}
