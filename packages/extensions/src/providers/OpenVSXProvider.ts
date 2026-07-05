import type { MarketplaceProvider } from "../domain/MarketplaceProvider.js";
import { ExtensionError, ExtensionErrorCode } from "../domain/errors.js";
import type { Extension, ExtensionQuery, ExtensionQueryResult } from "../domain/types.js";

interface OpenVSXResponse {
  offset: number;
  totalSize: number;
  extensions: Array<{
    name: string;
    namespace: string;
    displayName?: string;
    description?: string;
    version: string;
    downloadCount: number;
    averageRating: number;
    files?: { icon?: string };
  }>;
}

export class OpenVSXProvider implements MarketplaceProvider {
  private readonly baseUrl: string;
  private readonly registryUrl: string;
  public readonly itemUrl: string;

  constructor(options?: { galleryUrl?: string; itemUrl?: string }) {
    // Note: The VS Code gallery API URL (e.g. /vscode/gallery) is different from the Open VSX REST API.
    // If a user sets the VS Code gallery URL, we attempt to derive the REST API base URL.
    // E.g. https://open-vsx.org/vscode/gallery -> https://open-vsx.org/api
    let apiBase = "https://open-vsx.org/api";
    if (options?.galleryUrl) {
      try {
        const url = new URL(options.galleryUrl);
        apiBase = `${url.protocol}//${url.host}/api`;
      } catch {
        // fallback
      }
    }

    this.baseUrl = `${apiBase}/-/search`;
    this.registryUrl = apiBase;
    this.itemUrl = options?.itemUrl || "https://open-vsx.org/vscode/item";
  }

  async search(query: ExtensionQuery): Promise<ExtensionQueryResult> {
    try {
      const url = new URL(this.baseUrl);
      if (query.query) {
        url.searchParams.set("query", query.query);
      }

      const size = query.size ?? 30;
      const page = query.page ?? 1;
      const offset = (page - 1) * size;

      url.searchParams.set("size", size.toString());
      url.searchParams.set("offset", offset.toString());

      if (query.sortBy) url.searchParams.set("sortBy", query.sortBy);
      if (query.sortOrder) url.searchParams.set("sortOrder", query.sortOrder);

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 429) {
          throw new ExtensionError(
            ExtensionErrorCode.RateLimited,
            "Too many requests to Open VSX."
          );
        }
        if (response.status >= 500) {
          throw new ExtensionError(
            ExtensionErrorCode.RegistryUnavailable,
            "Open VSX registry is currently unavailable."
          );
        }
        throw new ExtensionError(
          ExtensionErrorCode.Unknown,
          `Registry returned ${response.status}`
        );
      }

      const data = (await response.json()) as OpenVSXResponse;

      const results: Extension[] = data.extensions.map((ext) => ({
        id: `${ext.namespace}.${ext.name}`,
        name: ext.name,
        namespace: ext.namespace,
        displayName: ext.displayName || ext.name,
        description: ext.description || "",
        version: ext.version,
        publisher: ext.namespace,
        iconUrl: ext.files?.icon,
        downloadCount: ext.downloadCount,
        rating: ext.averageRating
      }));

      return {
        results,
        total: data.totalSize,
        offset: data.offset
      };
    } catch (error) {
      if (error instanceof ExtensionError) {
        throw error;
      }
      if (
        error instanceof Error &&
        (error.message.includes("fetch") || error.message.includes("network"))
      ) {
        throw new ExtensionError(
          ExtensionErrorCode.Offline,
          "You appear to be offline or the network is unreachable."
        );
      }
      throw new ExtensionError(
        ExtensionErrorCode.Unknown,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async getDetails(id: string): Promise<Extension | null> {
    const [namespace, name] = id.split(".");
    try {
      const response = await fetch(`${this.registryUrl}/${namespace}/${name}`);
      if (!response.ok) return null;
      const data = (await response.json()) as {
        namespace: string;
        name: string;
        displayName?: string;
        description?: string;
        version: string;
        files?: { icon?: string; download?: string; readme?: string };
        downloadCount: number;
        averageRating: number;
      };

      return {
        id: `${data.namespace}.${data.name}`,
        name: data.name,
        namespace: data.namespace,
        displayName: data.displayName || data.name,
        description: data.description || "",
        version: data.version,
        publisher: data.namespace,
        iconUrl: data.files?.icon,
        downloadCount: data.downloadCount,
        rating: data.averageRating,
        _files: data.files
      };
    } catch {
      return null;
    }
  }

  async download(id: string, version?: string): Promise<Buffer> {
    let downloadUrl: string | undefined;

    if (version) {
      const [namespace, name] = id.split(".");
      const response = await fetch(`${this.registryUrl}/${namespace}/${name}/${version}`);
      if (response.ok) {
        const data = (await response.json()) as { files?: { download?: string } };
        downloadUrl = data.files?.download;
      }
    } else {
      const details = await this.getDetails(id);
      downloadUrl = details?._files?.download;
    }

    if (!downloadUrl) {
      throw new Error(`Cannot find download URL for ${id}${version ? `@${version}` : ""}`);
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download extension: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  getCategories(): Promise<string[]> {
    return Promise.resolve([
      "Programming Languages",
      "Snippets",
      "Linters",
      "Themes",
      "Debuggers",
      "Formatters",
      "Keymaps",
      "SCM Providers",
      "Other"
    ]);
  }

  async getVersions(id: string): Promise<string[]> {
    const [namespace, name] = id.split(".");
    try {
      const response = await fetch(`${this.registryUrl}/${namespace}/${name}`);
      if (!response.ok) return [];
      const data = (await response.json()) as { allVersions?: Record<string, string> };
      if (!data.allVersions) return [];

      // Filter out 'latest' if it's just an alias
      return Object.keys(data.allVersions).filter((v) => v !== "latest");
    } catch {
      return [];
    }
  }

  async getReadme(id: string): Promise<string> {
    const details = await this.getDetails(id);
    if (!details || !details._files?.readme) {
      console.log(`No readme file path found for ${id}. details._files:`, details?._files);
      return "No README available for this extension.";
    }
    try {
      console.log(`Fetching README for ${id} from URL: ${details._files.readme}`);
      const response = await fetch(details._files.readme);
      if (!response.ok) {
        console.log(`Failed to fetch README. Status: ${response.status}`);
        return "No README available for this extension.";
      }
      const text = await response.text();
      console.log(`Successfully fetched README (${text.length} chars)`);
      return text;
    } catch (err) {
      console.error(`Error fetching README:`, err);
      return "No README available for this extension.";
    }
  }
}
