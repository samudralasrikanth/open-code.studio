import type { EditorGroup } from "../domain/EditorGroup.js";
import type { EditorInput } from "../domain/EditorInput.js";
import { WorkbenchLayout } from "../domain/WorkbenchLayout.js";
import { EditorEventBus } from "../events/EditorEventBus.js";
import { EditorEventTypes } from "../events/EditorEvents.js";

/**
 * Global service for managing Editor Groups and Layout.
 */
export class EditorService {
  private readonly layout: WorkbenchLayout = new WorkbenchLayout();
  public readonly eventBus: EditorEventBus = new EditorEventBus();

  public get activeGroup(): EditorGroup | undefined {
    return this.layout.activeGroup;
  }

  public get groups(): EditorGroup[] {
    return this.layout.groups;
  }

  /**
   * Opens an input in the active group (or a specific group if provided).
   */
  public openEditor(
    input: EditorInput,
    options?: { preview?: boolean; active?: boolean; group?: EditorGroup | string }
  ): void {
    let group: EditorGroup | undefined = this.layout.activeGroup;

    if (options?.group) {
      if (typeof options.group === "string") {
        group = this.layout.getGroup(options.group);
      } else {
        group = options.group;
      }
    }

    if (!group && this.layout.groups.length > 0) {
      group = this.layout.groups[0];
    }

    if (!group) {
      throw new Error("No active editor group found to open input.");
    }

    const previousActive = group.activeInput;
    group.openInput(input, options);

    this.eventBus.emit(EditorEventTypes.EDITOR_OPENED, { input, group });
    if (previousActive !== group.activeInput) {
      this.eventBus.emit(EditorEventTypes.EDITOR_ACTIVE_CHANGED, {
        input: group.activeInput,
        group
      });
    }
  }

  /**
   * Closes an input in a specific group or across all groups.
   */
  public closeEditor(input: EditorInput, group?: EditorGroup): void {
    if (group) {
      const previousActive = group.activeInput;
      group.closeInput(input);
      this.eventBus.emit(EditorEventTypes.EDITOR_CLOSED, { input, group });
      if (previousActive !== group.activeInput) {
        this.eventBus.emit(EditorEventTypes.EDITOR_ACTIVE_CHANGED, {
          input: group.activeInput,
          group
        });
      }
    } else {
      // Close everywhere
      for (const g of this.layout.groups) {
        if (g.inputs.includes(input)) {
          const previousActive = g.activeInput;
          g.closeInput(input);
          this.eventBus.emit(EditorEventTypes.EDITOR_CLOSED, { input, group: g });
          if (previousActive !== g.activeInput) {
            this.eventBus.emit(EditorEventTypes.EDITOR_ACTIVE_CHANGED, {
              input: g.activeInput,
              group: g
            });
          }
        }
      }
    }
  }
}
