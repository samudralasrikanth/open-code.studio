import * as fs from "node:fs/promises";

import { uriScheme, uriToPath } from "@ocs/workspace";

import type {
  CommandHandler,
  CreateFileCommand,
  DeleteFileCommand,
  RenameFileCommand
} from "../commands/Command.js";

// Note: In a pure DDD approach, these handlers might depend on the IVirtualFileSystem instead of raw fs,
// but for creating/deleting, the VFS might not have those methods yet based on our initial interface.
// For now, we use node fs, but wrap it in the command handler.

export class CreateFileCommandHandler implements CommandHandler<CreateFileCommand> {
  async execute(command: CreateFileCommand): Promise<void> {
    if (uriScheme(command.uri) !== "file") throw new Error("Unsupported scheme");
    const fsPath = uriToPath(command.uri);

    if (command.isDirectory) {
      await fs.mkdir(fsPath, { recursive: true });
    } else {
      // Just create an empty file if it doesn't exist
      await fs.writeFile(fsPath, "", { flag: "wx" });
    }
  }
}

export class DeleteFileCommandHandler implements CommandHandler<DeleteFileCommand> {
  async execute(command: DeleteFileCommand): Promise<void> {
    if (uriScheme(command.uri) !== "file") throw new Error("Unsupported scheme");
    const fsPath = uriToPath(command.uri);
    await fs.rm(fsPath, { recursive: true, force: true });
  }
}

export class RenameFileCommandHandler implements CommandHandler<RenameFileCommand> {
  async execute(command: RenameFileCommand): Promise<void> {
    if (uriScheme(command.sourceUri) !== "file" || uriScheme(command.targetUri) !== "file") {
      throw new Error("Unsupported scheme");
    }
    await fs.rename(uriToPath(command.sourceUri), uriToPath(command.targetUri));
  }
}
