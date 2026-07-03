import type { TerminalState } from "./TerminalState.js";

export interface TerminalSession {
  id: string;
  name: string;
  shell: string;
  cwd: string;
  pid?: number;
  status: TerminalState;
  createdAt: Date;
}
