import type { ICommand } from "../domain/Command.js";

/**
 * Event emitted when a command is registered.
 */
export interface CommandRegisteredEvent {
  commandId: string;
  command: ICommand;
}

/**
 * Event emitted immediately before a command executes.
 */
export interface CommandExecutingEvent {
  commandId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: Record<string, any>;
}

/**
 * Event emitted immediately after a command executes successfully.
 */
export interface CommandExecutedEvent {
  commandId: string;
  durationMs: number;
}

/**
 * Event emitted when a command execution fails.
 */
export interface CommandFailedEvent {
  commandId: string;
  error: Error;
  durationMs: number;
}
