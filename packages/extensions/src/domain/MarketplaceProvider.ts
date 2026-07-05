import type { Extension, ExtensionQuery, ExtensionQueryResult } from "./types.js";

export interface MarketplaceProvider {
  search(query: ExtensionQuery): Promise<ExtensionQueryResult>;
  getDetails(id: string): Promise<Extension | null>;
  download(id: string, version?: string): Promise<Buffer>;
  getCategories(): Promise<string[]>;
  getVersions(id: string): Promise<string[]>;
  getReadme(id: string): Promise<string>;
}
