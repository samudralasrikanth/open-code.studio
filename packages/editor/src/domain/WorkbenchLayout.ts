import { EditorGroup } from "./EditorGroup.js";

/**
 * Manages the layout of multiple EditorGroups (e.g. split view).
 * For now, this is a simple linear list of groups, but could be upgraded to a Grid/Tree.
 */
export class WorkbenchLayout {
  private _groups: EditorGroup[] = [];
  private _activeGroup?: EditorGroup | undefined;

  constructor() {
    // Start with one default group
    const mainGroup = new EditorGroup("main");
    this._groups.push(mainGroup);
    this._activeGroup = mainGroup;
  }

  public get groups(): EditorGroup[] {
    return this._groups;
  }

  public get activeGroup(): EditorGroup | undefined {
    return this._activeGroup;
  }

  public setActiveGroup(group: EditorGroup): void {
    if (this._groups.includes(group)) {
      this._activeGroup = group;
    }
  }

  public addGroup(group: EditorGroup, activate: boolean = true): void {
    this._groups.push(group);
    if (activate) {
      this._activeGroup = group;
    }
  }

  public removeGroup(group: EditorGroup): void {
    const index = this._groups.indexOf(group);
    if (index >= 0) {
      this._groups.splice(index, 1);
      if (this._activeGroup === group) {
        // Fall back to first group
        this._activeGroup = this._groups[0];
      }
    }
  }

  public getGroup(id: string): EditorGroup | undefined {
    return this._groups.find((g) => g.id === id);
  }
}
