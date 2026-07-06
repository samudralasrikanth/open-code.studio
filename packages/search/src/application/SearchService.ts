import type { EventBus } from "@ocs/common";
import type { SearchQuery, SearchResult } from "../domain/SearchQuery.js";
import type { SearchProvider } from "../providers/SearchProvider.js";

export class SearchService {
  private readonly resultCache = new Map<string, SearchResult[]>();

  constructor(
    private readonly provider: SearchProvider,
    private readonly eventBus: EventBus
  ) {}

  public getCachedResults(queryId: string): SearchResult[] | undefined {
    return this.resultCache.get(queryId);
  }

  public clearCachedResults(queryId: string): void {
    this.resultCache.delete(queryId);
  }

  public async executeSearch(query: SearchQuery, cwd: string): Promise<void> {
    try {
      this.eventBus.publish("search.started", { queryId: query.id });

      this.resultCache.set(query.id, []);

      const onResult = (result: SearchResult) => {
        this.resultCache.get(query.id)?.push(result);
        this.eventBus.publish("search.resultFound", { queryId: query.id, result });
      };

      const onProgress = (progress: { filesScanned: number; matchesFound: number }) => {
        this.eventBus.publish("search.progress", { queryId: query.id, ...progress });
      };

      const totalMatches = await this.provider.search(query, cwd, onResult, onProgress);
      await this.eventBus.publish("search.completed", { queryId: query.id, totalMatches });
    } catch (err: any) {
      await this.eventBus.publish("search.cancelled", { queryId: query.id, error: err.message });
    }
  }

  public cancelSearch(queryId: string): void {
    this.provider.cancel(queryId);
    this.eventBus.publish("search.cancelled", { queryId });
  }
}
