import fuzzysort from "fuzzysort";

import type { ICommand } from "../domain/Command.js";

import type { CommandRegistry } from "./CommandRegistry.js";

export interface CommandSearchResult {
  command: ICommand;
  score: number;
  highlightedTitle?: string;
}

/**
 * Provides fuzzy-search capabilities over the registered commands.
 */
export class CommandSearch {
  constructor(private readonly registry: CommandRegistry) {}

  /**
   * Searches for commands matching the given query using fuzzysort.
   * If query is empty, returns all commands sorted alphabetically by title.
   *
   * @param query The search string
   * @param limit Maximum number of results to return
   */
  public search(query: string, limit: number = 50): CommandSearchResult[] {
    const commands = this.registry.getAll().filter((c) => c.isVisible !== false);

    if (!query || query.trim() === "") {
      return commands
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, limit)
        .map((command) => ({ command, score: 0 }));
    }

    const results = fuzzysort.go(query, commands, {
      keys: ["title", "id", "category"],
      limit,
      threshold: -10000 // Adjust based on fuzzysort's scoring logic
    });

    return results.map((result) => {
      // (fuzzysort as any).highlight returns an HTML-like string if we pass open/close tags
      // For UI use, we might just pass the raw score or simple string.
      // E.g., `result[0]` corresponds to the "title" match.
      const highlightedTitle =
        result[0] && typeof (result[0] as any).highlight === "function"
          ? (result[0] as any).highlight("<b>", "</b>")
          : result.obj.title;

      return {
        command: result.obj,
        score: result.score,
        highlightedTitle
      };
    });
  }
}
