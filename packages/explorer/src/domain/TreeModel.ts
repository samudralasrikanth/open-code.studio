import type { WorkspaceUri } from "@ocs/workspace";

import type { FileType } from "./VirtualFileSystem.js";

/**
 * A generic node in the Explorer tree. It could be a file, folder, or something else (Git node, Search result).
 */
export interface ExplorerNode {
  /**
   * Unique identifier for this node (typically the string representation of its URI).
   */
  id: string;

  /**
   * Display name of the node.
   */
  name: string;

  /**
   * The underlying URI of this node (if applicable).
   */
  uri?: WorkspaceUri;

  /**
   * The type of the node. Used to determine icons and default behaviors.
   */
  type: FileType;

  /**
   * Children of this node, if it is a directory or container.
   * Undefined if children have not been loaded yet.
   */
  children?: ExplorerNode[];

  /**
   * Parent ID to establish the hierarchy.
   */
  parentId?: string;

  /**
   * Whether this node is a directory/container.
   */
  isDirectory: boolean;
}

/**
 * A node that is currently visible in the virtualized list.
 */
export interface VisibleNode {
  node: ExplorerNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
}

/**
 * Model representing the state of the tree.
 * Owns expansion, selection, and flattening of the tree for rendering.
 */
export class TreeModel {
  private rootNode: ExplorerNode | null = null;
  private nodes: Map<string, ExplorerNode> = new Map();
  private expandedNodes: Set<string> = new Set();
  private selectedNodes: Set<string> = new Set();

  constructor(private onStateChange?: () => void) {}

  /**
   * Sets the root of the tree.
   */
  public setRoot(node: ExplorerNode) {
    this.rootNode = node;
    this.nodes.clear();
    this.registerNode(node);
    this.expandedNodes.add(node.id); // Expand root by default
    this.emitChange();
  }

  /**
   * Retrieves a node by ID.
   */
  public getNode(id: string): ExplorerNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Updates the children for a specific node.
   * This is an immutable-like update at the model level for the given node.
   */
  public setChildren(parentId: string, children: ExplorerNode[]) {
    const parent = this.nodes.get(parentId);
    if (!parent) return;

    // Sort folders first, then files
    const sortedChildren = [...children].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    // Remove old children from the map if we want strict consistency,
    // but for now, we just overwrite and register new ones.
    parent.children = sortedChildren;
    for (const child of sortedChildren) {
      child.parentId = parentId;
      this.registerNode(child);
    }
    this.emitChange();
  }

  /**
   * Adds or updates a single node.
   */
  public upsertNode(node: ExplorerNode) {
    const existing = this.nodes.get(node.id);
    if (existing && existing.parentId) {
      node.parentId = existing.parentId;
    }

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        const index = parent.children.findIndex((c) => c.id === node.id);
        if (index >= 0) {
          parent.children[index] = node;
        } else {
          parent.children.push(node);
          // Sorting could happen here
          parent.children.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });
        }
      }
    }

    this.registerNode(node);
    this.emitChange();
  }

  /**
   * Removes a node and all its descendants.
   */
  public removeNode(id: string) {
    const node = this.nodes.get(id);
    if (!node) return;

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent && parent.children) {
        parent.children = parent.children.filter((c) => c.id !== id);
      }
    }

    this.unregisterNodeAndDescendants(node);
    this.emitChange();
  }

  /**
   * Expands a node.
   */
  public expand(id: string) {
    if (this.expandedNodes.has(id)) return;
    this.expandedNodes.add(id);
    this.emitChange();
  }

  /**
   * Collapses a node.
   */
  public collapse(id: string) {
    if (!this.expandedNodes.has(id)) return;
    this.expandedNodes.delete(id);
    this.emitChange();
  }

  public isExpanded(id: string): boolean {
    return this.expandedNodes.has(id);
  }

  /**
   * Selects a node.
   */
  public select(id: string, multi: boolean = false) {
    if (!multi) {
      this.selectedNodes.clear();
    }
    this.selectedNodes.add(id);
    this.emitChange();
  }

  public isSelected(id: string): boolean {
    return this.selectedNodes.has(id);
  }

  public getSelectedNodeIds(): readonly string[] {
    return Array.from(this.selectedNodes);
  }

  public getExpandedCount(): number {
    return this.expandedNodes.size;
  }

  public getTotalNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Returns the root node ID.
   */
  public getRootId(): string | null {
    return this.rootNode?.id ?? null;
  }

  /**
   * Flattens the tree into a list of visible nodes for the virtualized renderer.
   * Renderer never walks the tree.
   */
  public getVisibleNodes(): VisibleNode[] {
    if (!this.rootNode) return [];

    const visible: VisibleNode[] = [];

    // Flatten starting from the root node itself so it acts as the top-level accordion
    this.flatten(this.rootNode, 0, visible);

    return visible;
  }

  private flatten(node: ExplorerNode, depth: number, result: VisibleNode[]) {
    const isExpanded = this.expandedNodes.has(node.id);
    const isSelected = this.selectedNodes.has(node.id);

    result.push({
      node,
      depth,
      isExpanded,
      isSelected
    });

    if (isExpanded && node.children) {
      for (const child of node.children) {
        this.flatten(child, depth + 1, result);
      }
    }
  }

  private registerNode(node: ExplorerNode) {
    this.nodes.set(node.id, node);
  }

  private unregisterNodeAndDescendants(node: ExplorerNode) {
    this.nodes.delete(node.id);
    this.expandedNodes.delete(node.id);
    this.selectedNodes.delete(node.id);

    if (node.children) {
      for (const child of node.children) {
        this.unregisterNodeAndDescendants(child);
      }
    }
  }

  private emitChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
