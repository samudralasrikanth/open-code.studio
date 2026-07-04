import { Container, EventBus } from "@ocs/common";
import { SearchService, ReplaceService, RipgrepProvider } from "@ocs/search";

export function bootstrapSearch(container: Container, eventBus: EventBus): void {
  const searchProvider = new RipgrepProvider();
  container.singleton(Symbol.for("SearchProvider"), () => searchProvider);
  container.singleton(
    Symbol.for("SearchService"),
    () => new SearchService(searchProvider, eventBus)
  );
  container.singleton(Symbol.for("ReplaceService"), () => new ReplaceService());
}
