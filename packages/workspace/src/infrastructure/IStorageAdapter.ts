/**
 * IStorageAdapter — persistence interface for the workspace registry.
 *
 * The first implementation uses a plain JSON file. Future implementations
 * could use SQLite, cloud sync, or OS keychains without touching
 * WorkspaceRegistry or WorkspaceSettingsRepository.
 */

export interface IStorageAdapter<T> {
  /** Load the stored value. Returns undefined if no data exists yet. */
  load(): Promise<T | undefined>;

  /** Persist the value. Creates the storage location if needed. */
  save(value: T): Promise<void>;

  /** Remove all stored data. */
  clear(): Promise<void>;
}
