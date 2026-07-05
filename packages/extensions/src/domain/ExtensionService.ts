import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { ExtensionRegistry } from "./ExtensionRegistry.js";
import type { MarketplaceProvider } from "./MarketplaceProvider.js";
import { MemoryCache } from "./cache.js";
import type { Extension, ExtensionQuery, ExtensionQueryResult } from "./types.js";
import { ExtensionInstallError, type ExtensionManifest } from "./types.js";

export class ExtensionService {
  private popularCache = new MemoryCache<ExtensionQueryResult>({ ttlMs: 10 * 60 * 1000 }); // 10 min
  private searchCache = new MemoryCache<ExtensionQueryResult>({ ttlMs: 5 * 60 * 1000 }); // 5 min
  private detailsCache = new MemoryCache<Extension>({ ttlMs: 30 * 60 * 1000 }); // 30 min

  constructor(
    private provider: MarketplaceProvider,
    private registry: ExtensionRegistry
  ) {}

  async search(query: ExtensionQuery): Promise<ExtensionQueryResult> {
    const q = query.query || "";
    const page = query.page ?? 1;
    const size = query.size ?? 30;

    // Sort filters and other properties to ensure deterministic cache key
    const cacheKey = JSON.stringify({
      query: q,
      page,
      size,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters: query.filters
    });

    // Use different caches based on whether it's a search or popular query
    const cache = q ? this.searchCache : this.popularCache;
    const cached = cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    if (!q) {
      query.sortBy = query.sortBy ?? "downloadCount";
      query.sortOrder = query.sortOrder ?? "desc";
    }

    const result = await this.provider.search({ ...query, page, size });

    if (q) {
      const exactMatchIdx = result.results.findIndex(
        (ext) => ext.name.toLowerCase() === q.toLowerCase()
      );
      if (exactMatchIdx > 0) {
        const exactMatch = result.results.splice(exactMatchIdx, 1)[0];
        if (exactMatch) {
          result.results.unshift(exactMatch);
        }
      }
    }

    cache.set(cacheKey, result);
    return result;
  }

  async getDetails(id: string): Promise<Extension | null> {
    let details = this.detailsCache.get(id) ?? (await this.provider.getDetails(id));

    if (details) {
      this.detailsCache.set(id, details);

      // Augment with local registry info if installed
      const installedInfo = await this.registry.get(id);
      if (installedInfo) {
        details = {
          ...details,
          installed: true,
          enabled: installedInfo.enabled,
          manifest: installedInfo.manifest
        };
      }
    }

    return details;
  }

  async getReadme(id: string): Promise<string> {
    return this.provider.getReadme(id);
  }

  async getVersions(id: string): Promise<string[]> {
    return this.provider.getVersions(id);
  }

  async download(id: string, version?: string): Promise<Buffer> {
    return this.provider.download(id, version);
  }

  async install(id: string, version?: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    const AdmZip = (await import("adm-zip")).default;

    let vsixBuffer: Buffer;
    try {
      vsixBuffer = await this.provider.download(id, version);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new ExtensionInstallError("DOWNLOAD_FAILED", `Failed to download extension: ${msg}`);
    }

    // Extract to a temp directory first for validation
    const tempExtractDir = await fs.mkdtemp(path.join(os.tmpdir(), `ocs-ext-${id}-`));
    const tempFile = path.join(os.tmpdir(), `${id}.vsix`);

    await fs.writeFile(tempFile, vsixBuffer);

    try {
      const zip = new AdmZip(tempFile);
      zip.extractAllTo(tempExtractDir, true);
    } catch (e: unknown) {
      await fs.unlink(tempFile).catch(() => {});
      await fs.rm(tempExtractDir, { recursive: true, force: true }).catch(() => {});
      const msg = e instanceof Error ? e.message : String(e);
      throw new ExtensionInstallError("CORRUPTED", `Failed to extract VSIX archive: ${msg}`);
    }

    // Clean up zip file
    await fs.unlink(tempFile).catch(() => {});

    // Validate the extracted contents
    const packageJsonPath = path.join(tempExtractDir, "extension", "package.json");
    let manifest: ExtensionManifest;

    try {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      manifest = JSON.parse(content) as ExtensionManifest;
    } catch {
      await fs.rm(tempExtractDir, { recursive: true, force: true }).catch(() => {});
      throw new ExtensionInstallError(
        "INVALID_MANIFEST",
        "package.json is missing or invalid in the extension archive."
      );
    }

    // Validate compatibility (Simple check for now)
    const engineVersion = manifest.engines?.vscode;
    if (engineVersion && (engineVersion.startsWith("^0.") || engineVersion.startsWith("~0."))) {
      await fs.rm(tempExtractDir, { recursive: true, force: true }).catch(() => {});
      throw new ExtensionInstallError(
        "INCOMPATIBLE",
        `Extension requires incompatible vscode engine version: ${engineVersion}`
      );
    }

    // Move to final directory
    const extensionsDir = path.join(os.homedir(), ".ocs", "extensions");
    const targetDir = path.join(extensionsDir, id);

    await fs.mkdir(extensionsDir, { recursive: true });

    // If it already exists, remove it first (for upgrades/reinstalls)
    await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {});

    // Rename temp extracted dir to target dir
    // On some OSes fs.rename across devices fails, so we might need a fallback, but tmpdir is usually same disk
    try {
      await fs.rename(tempExtractDir, targetDir);
    } catch {
      // Fallback: cp and rm
      await fs.cp(tempExtractDir, targetDir, { recursive: true });
      await fs.rm(tempExtractDir, { recursive: true, force: true });
    }

    // Register with the registry
    await this.registry.register(id, manifest);
  }

  async isInstalled(id: string): Promise<boolean> {
    const installed = await this.registry.get(id);
    return !!installed;
  }

  async uninstall(id: string): Promise<void> {
    const extensionsDir = path.join(os.homedir(), ".ocs", "extensions");
    const targetDir = path.join(extensionsDir, id);

    // Remove the extension files
    await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {});

    // Unregister it
    await this.registry.unregister(id);
  }
}
