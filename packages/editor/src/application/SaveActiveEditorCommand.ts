import type { ICommand } from "@ocs/common";
import type { EditorService } from "./EditorService.js";

export class SaveActiveEditorCommand implements ICommand<void, void> {
  public readonly id = "workbench.action.files.save";

  constructor(private readonly editorService: EditorService) {}

  public async execute(): Promise<void> {
    const activeInput = this.editorService.activeGroup?.activeInput;
    if (activeInput) {
      try {
        await activeInput.save();
      } catch (error: any) {
        // Handle explicit save errors (e.g. conflicts, readonly)
        if (typeof process !== "undefined" && process.versions && process.versions.electron) {
          // @ts-ignore
          const { dialog } = await import("electron");
          await dialog.showMessageBox({
            type: "error",
            title: "Save Failed",
            message: `Failed to save ${activeInput.getName()}`,
            detail: error?.message || "An unknown error occurred.",
            buttons: ["OK"]
          });
        } else {
          console.error("Save Failed:", error);
        }
      }
    }
  }
}
