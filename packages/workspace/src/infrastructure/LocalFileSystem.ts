/**
 * LocalFileSystem — Node.js implementation of IFileSystem.
 *
 * This is the only file in @ocs/workspace that calls Node's `fs` directly.
 * All other code in the package uses IFileSystem.
 */

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { IFileSystem, StatResult } from "./IFileSystem.js";

export class LocalFileSystem implements IFileSystem {
  public async stat(path: string): Promise<StatResult> {
    const s = await stat(path);
    return {
      isDirectory: s.isDirectory(),
      isFile: s.isFile(),
      sizeBytes: s.size,
      mtimeMs: s.mtimeMs
    };
  }

  public async readDirectory(path: string): Promise<{ name: string; isDirectory: boolean }[]> {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(path, { withFileTypes: true });
    return entries.map((e) => ({ name: e.name, isDirectory: e.isDirectory() }));
  }

  public async exists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }

  public async readFile(path: string): Promise<string> {
    return readFile(path, "utf8");
  }

  public async writeFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, "utf8");
  }

  public async mkdir(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  public join(...segments: string[]): string {
    return join(...segments);
  }
}

/** Create the default local file system implementation. */
export function createLocalFileSystem(): IFileSystem {
  return new LocalFileSystem();
}
