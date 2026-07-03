import { EditorGroup } from "./EditorGroup.js";
import type { EditorLayout, SplitNode } from "./EditorLayout.js";

/**
 * Manages the layout tree of multiple EditorGroups (split view).
 */
export class WorkbenchLayout {
  private _groups: EditorGroup[] = [];
  private _activeGroup?: EditorGroup | undefined;
  private _layout: EditorLayout;

  constructor() {
    const mainGroup = new EditorGroup("main");
    this._groups.push(mainGroup);
    this._activeGroup = mainGroup;
    this._layout = {
      root: { type: "group", groupId: "main" }
    };
  }

  public get groups(): EditorGroup[] {
    return this._groups;
  }

  public get activeGroup(): EditorGroup | undefined {
    return this._activeGroup;
  }

  public get layout(): EditorLayout {
    return this._layout;
  }

  public setActiveGroup(group: EditorGroup): void {
    if (this._groups.includes(group)) {
      this._activeGroup = group;
    }
  }

  public addGroup(group: EditorGroup, activate: boolean = true): void {
    if (this._groups.some((g) => g.id === group.id)) return;
    this._groups.push(group);
    if (activate) {
      this._activeGroup = group;
    }
  }

  public removeGroup(group: EditorGroup): void {
    const index = this._groups.indexOf(group);
    if (index >= 0) {
      this._groups.splice(index, 1);

      // Remove from layout tree
      const newRoot = this.removeNode(this._layout.root, group.id);
      if (newRoot) {
        this._layout.root = newRoot;
      } else {
        // Fallback to one main group if everything is closed
        const mainGroup = new EditorGroup("main");
        this._groups = [mainGroup];
        this._activeGroup = mainGroup;
        this._layout = {
          root: { type: "group", groupId: "main" }
        };
      }

      if (this._activeGroup === group) {
        this._activeGroup = this._groups[0];
      }
    }
  }

  public getGroup(id: string): EditorGroup | undefined {
    return this._groups.find((g) => g.id === id);
  }

  /**
   * Splits a group, creating a new sibling group in the layout.
   */
  public splitGroup(
    group: EditorGroup,
    orientation: "horizontal" | "vertical",
    newGroupId: string
  ): EditorGroup {
    const newGroup = new EditorGroup(newGroupId);
    this._groups.push(newGroup);

    // Update layout tree
    this._layout.root = this.replaceNode(this._layout.root, group.id, {
      type: "split",
      orientation,
      left: { type: "group", groupId: group.id },
      right: { type: "group", groupId: newGroupId }
    });

    this._activeGroup = newGroup;
    return newGroup;
  }

  /**
   * Directly sets the layout tree and group list (used during restore state).
   */
  public restoreLayout(layout: EditorLayout, groups: EditorGroup[]): void {
    this._layout = layout;
    this._groups = groups;
    // Find active group if it exists in the new layout
    const active = groups[0];
    this._activeGroup = active;
  }

  private replaceNode(node: SplitNode, targetGroupId: string, replacement: SplitNode): SplitNode {
    if (node.type === "group") {
      if (node.groupId === targetGroupId) {
        return replacement;
      }
      return node;
    }
    return {
      type: "split",
      orientation: node.orientation,
      left: this.replaceNode(node.left, targetGroupId, replacement),
      right: this.replaceNode(node.right, targetGroupId, replacement)
    };
  }

  private removeNode(node: SplitNode, targetGroupId: string): SplitNode | null {
    if (node.type === "group") {
      if (node.groupId === targetGroupId) {
        return null;
      }
      return node;
    }

    const left = this.removeNode(node.left, targetGroupId);
    const right = this.removeNode(node.right, targetGroupId);

    if (left === null) return right;
    if (right === null) return left;

    return {
      type: "split",
      orientation: node.orientation,
      left,
      right
    };
  }
}
