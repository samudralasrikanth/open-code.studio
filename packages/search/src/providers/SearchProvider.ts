import type { SearchQuery, SearchResult } from "../domain/SearchQuery.js";

export interface SearchProvider {
  /**
   * Executes a search query.
   * @param query The query options
   * @param cwd The workspace root directory
   * @param onResult Callback for streaming results
   * @param onProgress Callback for progress tracking (if supported)
   * @returns A promise resolving to total number of results found, or rejecting if aborted.
   */
  search(
    query: SearchQuery,
    cwd: string,
    onResult: (result: SearchResult) => void,
    onProgress?: (progress: { filesScanned: number; matchesFound: number }) => void
  ): Promise<number>;

  /**
   * Cancel an ongoing search by query ID.
   */
  cancel(queryId: string): void;
}
