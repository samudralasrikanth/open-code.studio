/**
 * IFileSystem — file system abstraction interface.
 *
 * WorkspaceService never calls Node's `fs` directly.
 * All file system operations go through this interface so that future
 * implementations (SSH, container, cloud) can be swapped in transparently.
 *
 * Only the operations required by EPIC-0004 are defined here.
 * Additional methods will be added in later epics as needed.
 */

export interface StatResult {
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly sizeBytes: number;
  readonly mtimeMs: number;
}

export interface IFileSystem {
  /**
   * Returns stat information for the given path.
   * Throws if the path does not exist or is not accessible.
   */
  stat(path: string): Promise<StatResult>;

  /**
   * Reads directory contents.
   */
  readDirectory(path: string): Promise<{ name: string; isDirectory: boolean }[]>;

  /**
   * Returns true if the path exists and is accessible, false otherwise.
   * Never throws.
   */
  exists(path: string): Promise<boolean>;

  /**
   * Reads the entire file at the given path as a UTF-8 string.
   * Throws if the file does not exist or is not readable.
   */
  readFile(path: string): Promise<string>;

  /**
   * Writes a UTF-8 string to the given path, creating parent directories as
   * needed.
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Creates the directory at the given path, including all ancestors.
   * Does nothing if the directory already exists.
   */
  mkdir(path: string): Promise<void>;

  /**
   * Joins path segments using the platform separator.
   * Synchronous — no I/O.
   */
  join(...segments: string[]): string;
}
