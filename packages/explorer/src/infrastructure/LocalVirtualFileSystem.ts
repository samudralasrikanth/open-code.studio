import * as fs from "node:fs/promises";

import type { WorkspaceUri } from "@ocs/workspace";
import { uriScheme, uriToPath, uriFromString } from "@ocs/workspace";

import type { IVirtualFileSystem, FileStat } from "../domain/VirtualFileSystem.js";
import { FileType } from "../domain/VirtualFileSystem.js";

/**
 * Node.js specific implementation of IVirtualFileSystem.
 */
export class LocalVirtualFileSystem implements IVirtualFileSystem {
  public async stat(uri: WorkspaceUri): Promise<FileStat> {
    if (uriScheme(uri) !== "file") {
      throw new Error(`Unsupported scheme: ${uriScheme(uri)}`);
    }

    const fsPath = uriToPath(uri);
    const stats = await fs.stat(fsPath);
    let type = FileType.Unknown;

    if (stats.isFile()) type = FileType.File;
    else if (stats.isDirectory()) type = FileType.Directory;
    else if (stats.isSymbolicLink()) type = FileType.SymbolicLink;

    return {
      type,
      ctime: stats.ctimeMs,
      mtime: stats.mtimeMs,
      size: stats.size
    };
  }

  public async readDirectory(uri: WorkspaceUri): Promise<[string, FileType][]> {
    if (uriScheme(uri) !== "file") {
      throw new Error(`Unsupported scheme: ${uriScheme(uri)}`);
    }

    const fsPath = uriToPath(uri);
    const entries = await fs.readdir(fsPath, { withFileTypes: true });

    return entries.map((entry) => {
      let type = FileType.Unknown;
      if (entry.isFile()) type = FileType.File;
      else if (entry.isDirectory()) type = FileType.Directory;
      else if (entry.isSymbolicLink()) type = FileType.SymbolicLink;

      return [entry.name, type];
    });
  }

  public async resolveSymbolicLink(uri: WorkspaceUri): Promise<WorkspaceUri> {
    if (uriScheme(uri) !== "file") {
      throw new Error(`Unsupported scheme: ${uriScheme(uri)}`);
    }

    const fsPath = uriToPath(uri);
    const realPath = await fs.realpath(fsPath);

    // Convert back to file URI format. Note: on Windows we might need to handle drive letters properly.
    // WorkspaceUri implementation handles basic local path normalization.
    return uriFromString(
      `file://${realPath.startsWith("/") ? "" : "/"}${realPath.replace(/\\/g, "/")}`
    );
  }
}
