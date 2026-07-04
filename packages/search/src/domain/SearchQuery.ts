export interface SearchQuery {
  id: string; // Unique search operation ID
  text: string;
  isRegex?: boolean;
  matchCase?: boolean;
  matchWholeWord?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
  maxResults?: number;
  // Options for replace preview
  replaceText?: string;
}

export interface SearchMatch {
  text: string;
  lineNumber: number; // 1-indexed
  column: number; // 1-indexed
  length: number;
}

export interface SearchResult {
  file: string; // Absolute path or workspace-relative path
  preview: string; // Surrounding context
  matches: SearchMatch[];
}

export interface ReplaceOperation {
  searchQueryId: string; // Ties back to original search
  file: string;
  replacementMatches: {
    lineNumber: number;
    column: number;
    length: number;
    replacementText: string;
  }[];
}
