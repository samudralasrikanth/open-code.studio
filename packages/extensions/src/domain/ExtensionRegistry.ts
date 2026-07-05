import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import type { InstalledExtension, ExtensionManifest } from "./types.js";

/**
 * Manages the local registry of installed extensions.
 * Provides fast access to extension metadata via `~/.ocs/extensions/registry.json`.
 */
export class ExtensionRegistry {
  private registryPath: string;
  private extensionsDir: string;
  private registry: Map<string, InstalledExtension> = new Map();
  private loaded = false;

  constructor() {
    this.extensionsDir = path.join(os.homedir(), ".ocs", "extensions");
    this.registryPath = path.join(this.extensionsDir, "registry.json");
  }

  /**
   * Initializes the registry by loading from disk.
   * If the registry doesn't exist, performs a full scan of `~/.ocs/extensions`.
   */
  public async load(): Promise<void> {
    if (this.loaded) return;

    await fs.mkdir(this.extensionsDir, { recursive: true });

    try {
      const data = await fs.readFile(this.registryPath, "utf-8");
      const parsed = JSON.parse(data) as InstalledExtension[];
      for (const ext of parsed) {
        this.registry.set(ext.id, ext);
      }
    } catch {
      // Registry file missing or corrupt. Do a startup scan.
      await this.scan();
    }

    this.loaded = true;
  }

  /**
   * Scans the extensions directory to rebuild the registry.
   */
  private async scan(): Promise<void> {
    this.registry.clear();
    let entries;
    try {
      entries = await fs.readdir(this.extensionsDir, { withFileTypes: true });
    } catch {
      return; // Directory doesn't exist yet
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const id = entry.name;
        const targetDir = path.join(this.extensionsDir, id);
        const packageJsonPath = path.join(targetDir, "extension", "package.json");

        try {
          const content = await fs.readFile(packageJsonPath, "utf-8");
          const manifest = JSON.parse(content) as ExtensionManifest;

          this.registry.set(id, {
            id,
            publisher: manifest.publisher,
            name: manifest.name,
            version: manifest.version,
            path: targetDir,
            enabled: true, // Default to true if rebuilding
            installedAt: Date.now(),
            manifest
          });
        } catch {
          // Skip if missing package.json or invalid JSON
        }
      }
    }

    await this.save();
  }

  /**
   * Registers a newly installed extension.
   */
  public async register(id: string, manifest: ExtensionManifest): Promise<void> {
    await this.load();

    const targetDir = path.join(this.extensionsDir, id);
    const existing = this.registry.get(id);

    this.registry.set(id, {
      id,
      publisher: manifest.publisher || existing?.publisher || "",
      name: manifest.name || existing?.name || id,
      version: manifest.version || existing?.version || "1.0.0",
      path: targetDir,
      enabled: existing ? existing.enabled : true,
      installedAt: Date.now(),
      manifest
    });

    await this.save();
  }

  /**
   * Unregisters an extension upon uninstallation.
   */
  public async unregister(id: string): Promise<void> {
    await this.load();
    if (this.registry.delete(id)) {
      await this.save();
    }
  }

  /**
   * Enables an installed extension.
   */
  public async enable(id: string): Promise<void> {
    await this.load();
    const ext = this.registry.get(id);
    if (ext) {
      ext.enabled = true;
      await this.save();
    }
  }

  /**
   * Disables an installed extension.
   */
  public async disable(id: string): Promise<void> {
    await this.load();
    const ext = this.registry.get(id);
    if (ext) {
      ext.enabled = false;
      await this.save();
    }
  }

  /**
   * Gets all installed extensions.
   */
  public async getAll(): Promise<InstalledExtension[]> {
    await this.load();
    return Array.from(this.registry.values());
  }

  /**
   * Gets a specific installed extension by ID.
   */
  public async get(id: string): Promise<InstalledExtension | undefined> {
    await this.load();
    return this.registry.get(id);
  }

  /**
   * Saves the current registry state to disk.
   */
  private async save(): Promise<void> {
    await fs.mkdir(this.extensionsDir, { recursive: true });
    await fs.writeFile(
      this.registryPath,
      JSON.stringify(Array.from(this.registry.values()), null, 2),
      "utf-8"
    );
  }
}
