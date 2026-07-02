import type { EditorInput } from "./EditorInput.js";

export interface EditorGroupState {
  inputs: EditorInput[];
  activeInput?: EditorInput | undefined;
  previewInput?: EditorInput | undefined; // The single "preview" tab (italicized) that gets replaced on single-click
}

export class EditorGroup {
  public readonly id: string;
  private state: EditorGroupState = { inputs: [] };

  constructor(id: string) {
    this.id = id;
  }

  public get inputs(): EditorInput[] {
    return this.state.inputs;
  }

  public get activeInput(): EditorInput | undefined {
    return this.state.activeInput;
  }

  public get previewInput(): EditorInput | undefined {
    return this.state.previewInput;
  }

  public openInput(input: EditorInput, options?: { preview?: boolean; active?: boolean }): void {
    const isPreview = options?.preview ?? true;
    const makeActive = options?.active ?? true;

    // Check if input is already in this group
    const existingIndex = this.state.inputs.findIndex((i) => i.matches(input));

    if (existingIndex >= 0) {
      // It's already in the group. If it was the preview, and we are opening it not-as-preview, pin it.
      const existing = this.state.inputs[existingIndex];
      if (!isPreview && this.state.previewInput === existing) {
        this.state.previewInput = undefined; // It is now pinned
      }

      if (makeActive) {
        this.state.activeInput = existing;
      }
      return;
    }

    // It's not in the group. If it's a preview, we might replace the current preview.
    if (isPreview && this.state.previewInput) {
      // Replace the current preview
      const previewIndex = this.state.inputs.indexOf(this.state.previewInput);
      if (previewIndex >= 0) {
        this.state.inputs[previewIndex] = input;
      } else {
        this.state.inputs.push(input);
      }
    } else {
      // Just add it
      this.state.inputs.push(input);
    }

    if (isPreview) {
      this.state.previewInput = input;
    }

    if (makeActive) {
      this.state.activeInput = input;
    }
  }

  public closeInput(input: EditorInput): void {
    const index = this.state.inputs.findIndex((i) => i === input);
    if (index >= 0) {
      this.state.inputs.splice(index, 1);

      if (this.state.previewInput === input) {
        this.state.previewInput = undefined;
      }

      if (this.state.activeInput === input) {
        // Fallback to the adjacent tab, or undefined
        if (this.state.inputs.length > 0) {
          const nextIndex = Math.min(index, this.state.inputs.length - 1);
          this.state.activeInput = this.state.inputs[nextIndex];
        } else {
          this.state.activeInput = undefined;
        }
      }

      input.dispose();
    }
  }

  public pinInput(input: EditorInput): void {
    if (this.state.previewInput === input) {
      this.state.previewInput = undefined;
    }
  }
}
