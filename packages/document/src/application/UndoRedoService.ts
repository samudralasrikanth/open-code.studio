import type { WorkspaceUri } from "@ocs/workspace";

export interface IUndoRedoService {
  canUndo(uri: WorkspaceUri): boolean;
  canRedo(uri: WorkspaceUri): boolean;
  undo(uri: WorkspaceUri): Promise<void> | void;
  redo(uri: WorkspaceUri): Promise<void> | void;
  pushEdit(uri: WorkspaceUri, edit: unknown): void;
  clear(uri: WorkspaceUri): void;
}

export class UndoRedoService implements IUndoRedoService {
  private readonly stacks = new Map<string, { undo: unknown[]; redo: unknown[] }>();

  public canUndo(uri: WorkspaceUri): boolean {
    const stack = this.stacks.get(uri.toString());
    return (stack?.undo.length ?? 0) > 0;
  }

  public canRedo(uri: WorkspaceUri): boolean {
    const stack = this.stacks.get(uri.toString());
    return (stack?.redo.length ?? 0) > 0;
  }

  public undo(uri: WorkspaceUri): void {
    if (!this.canUndo(uri)) return;
    const stack = this.stacks.get(uri.toString())!;
    const edit = stack.undo.pop();
    stack.redo.push(edit);
  }

  public redo(uri: WorkspaceUri): void {
    if (!this.canRedo(uri)) return;
    const stack = this.stacks.get(uri.toString())!;
    const edit = stack.redo.pop();
    stack.undo.push(edit);
  }

  public pushEdit(uri: WorkspaceUri, edit: unknown): void {
    const key = uri.toString();
    if (!this.stacks.has(key)) {
      this.stacks.set(key, { undo: [], redo: [] });
    }
    const stack = this.stacks.get(key)!;
    stack.undo.push(edit);
    stack.redo = []; // clear redo stack on new edit
  }

  public clear(uri: WorkspaceUri): void {
    this.stacks.delete(uri.toString());
  }
}
