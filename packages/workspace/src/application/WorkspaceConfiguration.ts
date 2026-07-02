/**
 * WorkspaceConfiguration — reads and writes .ocs/workspace.json.
 *
 * Separation of concerns:
 *   WorkspaceConfiguration = reads/parses/validates the JSON
 *   WorkspaceSettingsRepository = persists it (via IStorageAdapter)
 *
 * Corrupted or missing files always produce DEFAULT_WORKSPACE_CONFIGURATION.
 * Invalid values in a well-formed file are replaced with defaults per-field.
 * The workspace will never fail to open because of a bad config file.
 */

import {
  DEFAULT_WORKSPACE_CONFIGURATION,
  type WorkspaceConfiguration as IWorkspaceConfiguration
} from "../domain/WorkspaceMetadata.js";
import type { IFileSystem } from "../infrastructure/IFileSystem.js";

export const WORKSPACE_CONFIG_FILENAME = ".ocs/workspace.json";

export class WorkspaceConfiguration {
  public constructor(private readonly fs: IFileSystem) {}

  /**
   * Read and validate the workspace config from the given folder.
   * Never throws — returns defaults on any error.
   */
  public async read(folderPath: string): Promise<{
    config: IWorkspaceConfiguration;
    found: boolean;
  }> {
    const configPath = this.fs.join(folderPath, WORKSPACE_CONFIG_FILENAME);
    const exists = await this.fs.exists(configPath);
    if (!exists) {
      return { config: DEFAULT_WORKSPACE_CONFIGURATION, found: false };
    }

    try {
      const raw = await this.fs.readFile(configPath);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { config: this.coerce(parsed), found: true };
    } catch {
      // Malformed JSON or unreadable file — silently use defaults
      return { config: DEFAULT_WORKSPACE_CONFIGURATION, found: true };
    }
  }

  /**
   * Write the given configuration to disk.
   * Creates .ocs/ if it does not exist.
   */
  public async write(folderPath: string, config: IWorkspaceConfiguration): Promise<void> {
    const ocsDir = this.fs.join(folderPath, ".ocs");
    await this.fs.mkdir(ocsDir);
    const configPath = this.fs.join(folderPath, WORKSPACE_CONFIG_FILENAME);
    await this.fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  private coerce(raw: Record<string, unknown>): IWorkspaceConfiguration {
    return {
      name: typeof raw["name"] === "string" ? raw["name"] : undefined,
      folders:
        Array.isArray(raw["folders"]) &&
        (raw["folders"] as unknown[]).every((f) => typeof f === "string")
          ? (raw["folders"] as string[])
          : [],
      settings:
        typeof raw["settings"] === "object" &&
        raw["settings"] !== null &&
        !Array.isArray(raw["settings"])
          ? (raw["settings"] as Record<string, unknown>)
          : {},
      schemaVersion: typeof raw["schemaVersion"] === "number" ? raw["schemaVersion"] : 1
    };
  }
}
