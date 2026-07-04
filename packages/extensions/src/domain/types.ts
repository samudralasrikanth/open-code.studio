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
