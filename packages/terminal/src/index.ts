/**
 * @ocs/terminal — public API
 */

export { TerminalState } from "./domain/TerminalState.js";
export type { TerminalSession } from "./domain/TerminalSession.js";
export type { TerminalProfile } from "./domain/TerminalProfile.js";

export { TerminalEventTypes } from "./events/TerminalEvents.js";
export type {
  TerminalEventType,
  TerminalCreatedPayload,
  TerminalClosedPayload,
  TerminalStartedPayload,
  TerminalStoppedPayload,
  TerminalOutputPayload,
  TerminalInputPayload,
  TerminalRenamedPayload,
  TerminalFocusChangedPayload,
  TerminalLayoutChangedPayload
} from "./events/TerminalEvents.js";

export { TerminalService } from "./application/TerminalService.js";
export type { CreateTerminalOptions } from "./application/TerminalService.js";

export { PtyAdapter } from "./infrastructure/PtyAdapter.js";
export type { IPtyProcess } from "./infrastructure/PtyAdapter.js";
