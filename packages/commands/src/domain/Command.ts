/**
 * Represents a logical condition that must be met for a command to be enabled.
 */
export interface ICommandContext {
  [key: string]: string | boolean | number;
}

/**
 * Core definition of a command in the platform.
 */
export interface ICommand {
  /**
   * Globally unique identifier for the command (e.g., 'editor.openFile').
   */
  readonly id: string;

  /**
   * Human-readable title of the command.
   */
  readonly title: string;

  /**
   * Category of the command (e.g., 'Editor', 'Workspace', 'Git').
   */
  readonly category: string;

  /**
   * The function to execute when the command is triggered.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (args?: Record<string, any>) => Promise<any> | any;

  /**
   * Optional context rules that must match the current IDE state for the command to be enabled.
   */
  readonly enableWhen?: Record<string, any>;

  /**
   * Whether the command is currently visible in the palette.
   * Default: true
   */
  readonly isVisible?: boolean;
}
