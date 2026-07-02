import type { WorkspaceUri } from "@ocs/workspace";

/**
 * File types for VFS entries.
 */
export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64
}

/**
 * File metadata details.
 */
export interface FileStat {
  type: FileType;
  ctime: number;
  mtime: number;
  size: number;
}

/**
 * Interface for reading directories and fetching basic file stats.
 */
export interface IVirtualFileSystem {
  /**
   * Retrieves the stats for a given file or directory.
   */
  stat(uri: WorkspaceUri): Promise<FileStat>;

  /**
   * Reads a directory and returns an array of [name, FileType] tuples.
   */
  readDirectory(uri: WorkspaceUri): Promise<[string, FileType][]>;

  /**
   * Resolves a symbolic link to its actual target.
   */
  resolveSymbolicLink(uri: WorkspaceUri): Promise<WorkspaceUri>;
}

/**
 * Interface for caching file metadata, primarily to optimize operations
 * like Search, Git, or AI processing that need stats frequently without hitting disk.
 */
export interface IFileMetadataCache {
  get(uri: WorkspaceUri): FileStat | undefined;
  set(uri: WorkspaceUri, stat: FileStat): void;
  invalidate(uri: WorkspaceUri): void;
  clear(): void;
}
