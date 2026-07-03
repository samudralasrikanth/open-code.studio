import type { WorkspaceUri } from "@ocs/workspace";

export interface EditorInputState {
  active: boolean;
  pinned: boolean;
  preview: boolean;
  dirty: boolean;
}

/**
 * Base abstract class for any content that can be opened in an Editor Group.
 * Examples: FileEditorInput, ImageEditorInput, SettingsEditorInput.
 */
export abstract class EditorInput {
  /**
   * The unique identifier for this input. Often the URI string, but can be a custom ID
   * for non-file inputs like "settings" or "welcome-page".
   */
  public abstract readonly id: string;

  /**
   * The display name shown in the editor tab.
   */
  public abstract getName(): string;

  /**
   * The optional tooltip shown on hover in the editor tab.
   */
  public abstract getTooltip(): string | undefined;

  /**
   * The URI associated with this input, if applicable.
   * Settings inputs or welcome pages might return undefined or a custom scheme (e.g. ocs-settings://).
   */
  public abstract readonly uri?: WorkspaceUri;

  /**
   * Whether this input has unsaved changes.
   */
  public abstract isDirty(): boolean;

  /**
   * Whether this input can be saved.
   */
  public abstract isReadonly(): boolean;

  /**
   * Called to determine if two inputs refer to the same logical content.
   */
  public matches(other: EditorInput): boolean {
    return this.id === other.id;
  }

  /**
   * Free any resources used by this input.
   */
  public dispose(): void {
    // Override if necessary
  }
}
