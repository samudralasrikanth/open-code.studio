import type { MarketplaceProvider } from "./MarketplaceProvider.js";
import { MemoryCache } from "./cache.js";
import type { Extension, ExtensionQuery, ExtensionQueryResult } from "./types.js";

export class ExtensionService {
  private popularCache = new MemoryCache<ExtensionQueryResult>({ ttlMs: 10 * 60 * 1000 }); // 10 min
  private searchCache = new MemoryCache<ExtensionQueryResult>({ ttlMs: 5 * 60 * 1000 }); // 5 min
  private detailsCache = new MemoryCache<Extension>({ ttlMs: 30 * 60 * 1000 }); // 30 min

  constructor(private provider: MarketplaceProvider) {}

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
    const cached = this.detailsCache.get(id);
    if (cached) return cached;

    const details = await this.provider.getDetails(id);
    if (details) {
      this.detailsCache.set(id, details);
    }
    return details;
  }

  async getReadme(id: string): Promise<string> {
    return this.provider.getReadme(id);
  }

  async install(id: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    const AdmZip = (await import("adm-zip")).default;

    // Download the .vsix buffer
    const vsixBuffer = await this.provider.download(id);

    // Extract to ~/.ocs/extensions/<id>
    const extensionsDir = path.join(os.homedir(), ".ocs", "extensions");
    const targetDir = path.join(extensionsDir, id);

    // Ensure the extensions directory exists
    await fs.mkdir(extensionsDir, { recursive: true });

    // Write buffer to a temp file
    const tempFile = path.join(os.tmpdir(), `${id}.vsix`);
    await fs.writeFile(tempFile, vsixBuffer);

    // Unzip the file
    try {
      const zip = new AdmZip(tempFile);
      zip.extractAllTo(targetDir, true);
    } finally {
      // Clean up the temp file
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  async isInstalled(id: string): Promise<boolean> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    const targetDir = path.join(os.homedir(), ".ocs", "extensions", id);
    try {
      const stat = await fs.stat(targetDir);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}
