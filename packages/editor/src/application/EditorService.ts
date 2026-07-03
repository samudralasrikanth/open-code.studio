import { EditorGroup } from "../domain/EditorGroup.js";
import type { EditorInput } from "../domain/EditorInput.js";
import type { EditorLayout } from "../domain/EditorLayout.js";
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

  public get editorLayout(): EditorLayout {
    return this.layout.layout;
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
      // If the group has no more inputs, we can close/remove the group if it's not the last one
      if (group.inputs.length === 0 && this.layout.groups.length > 1) {
        this.layout.removeGroup(group);
      }
    } else {
      // Close everywhere
      for (const g of [...this.layout.groups]) {
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
          if (g.inputs.length === 0 && this.layout.groups.length > 1) {
            this.layout.removeGroup(g);
          }
        }
      }
    }
  }

  /**
   * Splits the active editor group and returns the new group.
   */
  public splitActiveGroup(orientation: "horizontal" | "vertical", newGroupId: string): EditorGroup {
    const active = this.layout.activeGroup;
    if (!active) {
      throw new Error("No active editor group to split.");
    }
    const newGroup = this.layout.splitGroup(active, orientation, newGroupId);

    // Copy over the active input if it exists
    if (active.activeInput) {
      newGroup.openInput(active.activeInput, { preview: false, active: true });
    }

    if (newGroup.activeInput) {
      this.eventBus.emit(EditorEventTypes.EDITOR_OPENED, {
        input: newGroup.activeInput,
        group: newGroup
      });
      this.eventBus.emit(EditorEventTypes.EDITOR_ACTIVE_CHANGED, {
        input: newGroup.activeInput,
        group: newGroup
      });
    }

    return newGroup;
  }

  /**
   * Restores layout and tab states from serialized storage.
   */
  public async restoreState(
    state: {
      layout: EditorLayout;
      groups: { id: string; inputs: string[]; activeInput?: string; previewInput?: string }[];
      activeGroup?: string;
    },
    inputResolver: (uriStr: string) => Promise<EditorInput>
  ): Promise<void> {
    const newGroups: EditorGroup[] = [];

    for (const gState of state.groups) {
      const group = new EditorGroup(gState.id);
      newGroups.push(group);

      for (const inputId of gState.inputs) {
        try {
          const input = await inputResolver(inputId);
          const isPreview = inputId === gState.previewInput;
          const isActive = inputId === gState.activeInput;
          group.openInput(input, { preview: isPreview, active: isActive });
        } catch (e) {
          console.error(`Failed to restore editor input ${inputId}:`, e);
        }
      }
    }

    this.layout.restoreLayout(state.layout, newGroups);

    if (state.activeGroup) {
      const active = this.layout.getGroup(state.activeGroup);
      if (active) {
        this.layout.setActiveGroup(active);
      }
    }

    if (this.activeGroup) {
      this.eventBus.emit(EditorEventTypes.EDITOR_ACTIVE_CHANGED, {
        input: this.activeGroup.activeInput,
        group: this.activeGroup
      });
    }
  }
}
