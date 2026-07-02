import type { EditorGroup } from "../domain/EditorGroup.js";
import type { EditorInput } from "../domain/EditorInput.js";

export const EditorEventTypes = {
  EDITOR_OPENED: "editor.opened",
  EDITOR_CLOSED: "editor.closed",
  EDITOR_ACTIVE_CHANGED: "editor.active_changed"
} as const;

export type EditorEventType = (typeof EditorEventTypes)[keyof typeof EditorEventTypes];

export interface EditorOpenedPayload {
  input: EditorInput;
  group: EditorGroup;
}

export interface EditorClosedPayload {
  input: EditorInput;
  group: EditorGroup;
}

export interface EditorActiveChangedPayload {
  input: EditorInput | undefined;
  group: EditorGroup;
}

export interface EditorEvents {
  [EditorEventTypes.EDITOR_OPENED]: EditorOpenedPayload;
  [EditorEventTypes.EDITOR_CLOSED]: EditorClosedPayload;
  [EditorEventTypes.EDITOR_ACTIVE_CHANGED]: EditorActiveChangedPayload;
}
