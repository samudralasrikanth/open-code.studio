import type { ExplorerNode } from "./TreeModel.js";

/**
 * Represents a single decoration on an Explorer node.
 */
export interface ExplorerDecoration {
  /**
   * The text/badge to display (e.g. 'M', '1', 'U').
   */
  badge?: string;
  /**
   * The tooltip describing the decoration (e.g. 'Modified', '1 Error').
   */
  tooltip?: string;
  /**
   * The color to apply to the node text or badge.
   */
  color?: string;
  /**
   * Strikethrough for deleted or ignored files.
   */
  strikethrough?: boolean;
}

/**
 * A provider that supplies decorations.
 * Must stream updates via AsyncIterable.
 */
export interface ExplorerDecorationProvider {
  /**
   * Retrieves a stream of decorations for a given node.
   * Streaming allows fast providers to yield immediately while slow ones complete in the background.
   */
  getDecorations(node: ExplorerNode): AsyncIterable<ExplorerDecoration[]>;
}

/**
 * Registry to hold decoration providers and aggregate their results.
 */
export class DecorationRegistry {
  private providers: Set<ExplorerDecorationProvider> = new Set();

  public registerProvider(provider: ExplorerDecorationProvider): void {
    this.providers.add(provider);
  }

  public unregisterProvider(provider: ExplorerDecorationProvider): void {
    this.providers.delete(provider);
  }

  /**
   * Aggregates all decorations for a given node by consuming the async iterables from all providers.
   * This is a utility that the renderer or service might use if it wants a merged view,
   * though in practice the renderer might want to subscribe to streams directly.
   */
  public async *aggregateDecorations(node: ExplorerNode): AsyncIterable<ExplorerDecoration[]> {
    if (this.providers.size === 0) {
      yield [];
      return;
    }

    const iterators = Array.from(this.providers).map((p) =>
      p.getDecorations(node)[Symbol.asyncIterator]()
    );

    // A robust implementation would use Promise.race to yield updates as soon as ANY iterator yields.
    // For simplicity in this foundational version, we can just yield as we get results,
    // or return a combined async generator.

    // Simple naive aggregation:
    let allDecorations: ExplorerDecoration[] = [];
    for (const iterator of iterators) {
      try {
        const result = await iterator.next();
        if (!result.done && result.value) {
          allDecorations = allDecorations.concat(result.value);
          yield [...allDecorations];
        }
      } catch (e) {
        console.error("Error fetching decorations from provider", e);
      }
    }
  }
}

/**
 * A provider that supplies icons for an Explorer node.
 */
export interface IconProvider {
  /**
   * Gets an icon class or URL for the node.
   */
  getIcon(node: ExplorerNode): string;
}
