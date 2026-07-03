export const TerminalEventTypes = {
  CREATED: "terminal.created",
  CLOSED: "terminal.closed",
  STARTED: "terminal.started",
  STOPPED: "terminal.stopped",
  OUTPUT: "terminal.output",
  INPUT: "terminal.input",
  RENAMED: "terminal.renamed",
  FOCUS_CHANGED: "terminal.focusChanged",
  LAYOUT_CHANGED: "terminal.layoutChanged"
} as const;

export type TerminalEventType = (typeof TerminalEventTypes)[keyof typeof TerminalEventTypes];

export interface TerminalCreatedPayload {
  id: string;
  name: string;
  shell: string;
  cwd: string;
}

export interface TerminalClosedPayload {
  id: string;
}

export interface TerminalStartedPayload {
  id: string;
  pid: number;
}

export interface TerminalStoppedPayload {
  id: string;
  exitCode?: number;
}

export interface TerminalOutputPayload {
  id: string;
  data: string;
}

export interface TerminalInputPayload {
  id: string;
  data: string;
}

export interface TerminalRenamedPayload {
  id: string;
  name: string;
}

export interface TerminalFocusChangedPayload {
  id: string;
  focused: boolean;
}

export interface TerminalLayoutChangedPayload {
  id: string;
  cols: number;
  rows: number;
}
