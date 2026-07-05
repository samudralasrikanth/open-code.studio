export class ExtensionInstallError extends Error {
  constructor(
    public readonly code: "CORRUPTED" | "INVALID_MANIFEST" | "INCOMPATIBLE" | "DOWNLOAD_FAILED",
    message: string
  ) {
    super(message);
    this.name = "ExtensionInstallError";
  }
}

export interface Extension {
  id: string; // namespace.name
  name: string;
  namespace: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string; // usually namespace
  iconUrl?: string | undefined;
  downloadCount: number;
  rating: number;
  _files?:
    | {
        download?: string | undefined;
        readme?: string | undefined;
        icon?: string | undefined;
      }
    | undefined;
  installed?: boolean;
  enabled?: boolean;
  manifest?: ExtensionManifest;
}

export interface ExtensionQuery {
  query?: string;
  page?: number;
  size?: number;
  sortBy?: "relevance" | "downloadCount" | "rating" | "publishedDate";
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

export interface ExtensionQueryResult {
  results: Extension[];
  total: number;
  offset: number;
}

export interface ExtensionManifest {
  name: string;
  publisher: string;
  version: string;
  description?: string;
  engines?: {
    vscode?: string;
  };
  extensionDependencies?: string[];
  contributes?: {
    commands?: unknown[];
    themes?: unknown[];
    iconThemes?: unknown[];
    languages?: unknown[];
    [key: string]: unknown;
  };
  activationEvents?: string[];
  [key: string]: unknown;
}

export interface InstalledExtension {
  id: string; // publisher.name
  publisher: string;
  name: string;
  version: string;
  path: string; // Absolute path to the extracted extension folder
  enabled: boolean;
  installedAt: number;
  manifest: ExtensionManifest;
}
