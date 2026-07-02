/**
 * JsonStorageAdapter — IStorageAdapter backed by a JSON file.
 *
 * Writes are atomic: the new content is written to a `.tmp` file
 * and then renamed over the target, preventing partial writes from
 * corrupting stored state.
 */

import { rename, unlink } from "node:fs/promises";

import type { IFileSystem } from "./IFileSystem.js";
import type { IStorageAdapter } from "./IStorageAdapter.js";

export class JsonStorageAdapter<T> implements IStorageAdapter<T> {
  private readonly tmpPath: string;

  public constructor(
    private readonly filePath: string,
    private readonly fs: IFileSystem
  ) {
    this.tmpPath = `${filePath}.tmp`;
  }

  public async load(): Promise<T | undefined> {
    const exists = await this.fs.exists(this.filePath);
    if (!exists) return undefined;
    try {
      const raw = await this.fs.readFile(this.filePath);
      return JSON.parse(raw) as T;
    } catch {
      // Corrupted JSON — return undefined so the caller applies defaults
      return undefined;
    }
  }

  public async save(value: T): Promise<void> {
    const dir = this.filePath.slice(0, this.filePath.lastIndexOf("/"));
    await this.fs.mkdir(dir);
    await this.fs.writeFile(this.tmpPath, JSON.stringify(value, null, 2));
    await rename(this.tmpPath, this.filePath);
  }

  public async clear(): Promise<void> {
    try {
      await unlink(this.filePath);
    } catch {
      // Already absent — no error
    }
  }
}

export function createJsonStorageAdapter<T>(filePath: string, fs: IFileSystem): IStorageAdapter<T> {
  return new JsonStorageAdapter<T>(filePath, fs);
}
