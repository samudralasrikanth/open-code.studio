import type { ExplorerDecorationProvider } from "../domain/DecorationRegistry.js";
import type { ExplorerNode } from "../domain/TreeModel.js";

/**
 * An explorer contribution allows a provider to register custom context menus,
 * actions, and decorations into the Explorer Platform.
 */
export interface ExplorerContribution {
  /**
   * Optional decoration provider.
   */
  decorations?: ExplorerDecorationProvider;

  /**
   * Optional menu contributions (placeholder for future implementation).
   */
  menus?: unknown;
}

/**
 * Represents a source of data for the Explorer Platform.
 * Providers (Workspace, Search, Git) implement this to feed nodes into the tree.
 */
export interface ExplorerProvider {
  /**
   * Unique ID for the provider (e.g. 'workspace', 'search', 'git').
   */
  id: string;

  /**
   * Resolves the children for a given node.
   * If the node is null, it resolves the root nodes for this provider.
   */
  resolveChildren(node: ExplorerNode | null): Promise<ExplorerNode[]>;

  /**
   * Returns contributions (decorations, menus) provided by this provider.
   */
  getContribution?(): ExplorerContribution;
}
