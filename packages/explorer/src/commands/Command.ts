import type { WorkspaceUri } from "@ocs/workspace";

export interface Command {
  readonly id: string;
}

export interface CommandHandler<T extends Command, R = void> {
  execute(command: T): Promise<R>;

  // Future enhancements for undo/redo
  // undo?(command: T): Promise<void>;
  // redo?(command: T): Promise<void>;
}

export class CreateFileCommand implements Command {
  public readonly id = "explorer.command.createFile";
  constructor(
    public readonly uri: WorkspaceUri,
    public readonly isDirectory: boolean = false
  ) {}
}

export class DeleteFileCommand implements Command {
  public readonly id = "explorer.command.deleteFile";
  constructor(public readonly uri: WorkspaceUri) {}
}

export class RenameFileCommand implements Command {
  public readonly id = "explorer.command.renameFile";
  constructor(
    public readonly sourceUri: WorkspaceUri,
    public readonly targetUri: WorkspaceUri
  ) {}
}

// Additional commands like Copy, Move could be added here
