// Domain
export { EditorInput } from "./domain/EditorInput.js";
export type { EditorInputState } from "./domain/EditorInput.js";
export { DocumentEditorInput } from "./domain/DocumentEditorInput.js";
export { EditorGroup } from "./domain/EditorGroup.js";
export type { EditorGroupState } from "./domain/EditorGroup.js";
export { WorkbenchLayout } from "./domain/WorkbenchLayout.js";
export type { SplitNode, EditorLayout } from "./domain/EditorLayout.js";

// Application (should be imported directly by main process)

// Infrastructure
export type { EditorContribution, IEditorAdapter } from "./infrastructure/EditorContribution.js";

// Events
export { EditorEventTypes } from "./events/EditorEvents.js";
export type {
  EditorEventType,
  EditorEvents,
  EditorOpenedPayload,
  EditorClosedPayload,
  EditorActiveChangedPayload
} from "./events/EditorEvents.js";
