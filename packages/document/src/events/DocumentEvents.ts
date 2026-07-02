import type { WorkspaceUri } from "@ocs/workspace";

export const DocumentEventTypes = {
  DOCUMENT_OPENED: "document.opened",
  DOCUMENT_CLOSED: "document.closed",
  DOCUMENT_SAVED: "document.saved",
  DOCUMENT_CHANGED: "document.changed"
} as const;

export type DocumentEventType = (typeof DocumentEventTypes)[keyof typeof DocumentEventTypes];

export interface DocumentOpenedPayload {
  uri: WorkspaceUri;
}

export interface DocumentClosedPayload {
  uri: WorkspaceUri;
}

export interface DocumentSavedPayload {
  uri: WorkspaceUri;
}

export interface DocumentChangedPayload {
  uri: WorkspaceUri;
  isDirty: boolean;
}

export interface DocumentEvents {
  [DocumentEventTypes.DOCUMENT_OPENED]: DocumentOpenedPayload;
  [DocumentEventTypes.DOCUMENT_CLOSED]: DocumentClosedPayload;
  [DocumentEventTypes.DOCUMENT_SAVED]: DocumentSavedPayload;
  [DocumentEventTypes.DOCUMENT_CHANGED]: DocumentChangedPayload;
}
