import type { EditorInput } from "../domain/EditorInput.js";

export interface EditorContribution {
  /**
   * The unique ID of the contribution.
   */
  readonly id: string;

  /**
   * Called when an editor input is opened. This allows the contribution to attach listeners or UI.
   */
  onInputOpened?(input: EditorInput): void;

  /**
   * Called when an editor input is closed.
   */
  onInputClosed?(input: EditorInput): void;
}

/**
 * Adapter interface that renderers like Monaco must implement to bind to the Editor Platform.
 */
export interface IEditorAdapter {
  /**
   * Called to mount the editor renderer into a DOM element.
   */
  mount(container: HTMLElement): void;

  /**
   * Called to unmount and cleanup the editor renderer.
   */
  unmount(): void;

  /**
   * Instructs the renderer to display the given EditorInput.
   */
  openInput(input: EditorInput): Promise<void>;

  /**
   * Focuses the editor UI.
   */
  focus(): void;
}
