import type { URI } from "@ocs/common";

export interface CapabilityMap {
  canRename: boolean;
  canDelete: boolean;
  canMove: boolean;
  canCopy: boolean;
  canDrop: boolean;
}

export type NodeState = "collapsed" | "loading" | "loaded" | "error";

export interface ExplorerNode {
  readonly uri: URI;
  readonly name: string;
  readonly isDirectory: boolean;
  readonly capabilities: CapabilityMap;
  state: NodeState;
  children?: ExplorerNode[];
  error?: Error;
}

export interface TreeChange {
  added: ExplorerNode[];
  removed: URI[];
  updated: ExplorerNode[];
}

export interface VisibleNode {
  node: ExplorerNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
}

export class VirtualTreeModel {
  private _nodes = new Map<string, ExplorerNode>();
  private _roots: ExplorerNode[] = [];
  private _listeners: Set<(change: TreeChange) => void> = new Set();
  private _expandedNodeUris = new Set<string>();
  private _selectedNodeUris = new Set<string>();

  public setRoots(roots: ExplorerNode[]): void {
    this._roots = [...roots];
    this._nodes.clear();
    for (const root of roots) {
      this._nodes.set(root.uri.toString(), root);
    }
    this.notify({ added: roots, removed: [], updated: [] });
  }

  public getRoots(): ExplorerNode[] {
    return this._roots;
  }

  public getNode(uri: URI): ExplorerNode | undefined {
    return this._nodes.get(uri.toString());
  }

  public setChildren(parentUri: URI, children: ExplorerNode[]): void {
    const parent = this.getNode(parentUri);
    if (!parent) return;

    parent.children = [...children];
    parent.state = "loaded";

    for (const child of children) {
      this._nodes.set(child.uri.toString(), child);
    }

    this.notify({ added: children, removed: [], updated: [parent] });
  }

  public setNodeState(uri: URI, state: NodeState, error?: Error): void {
    const node = this.getNode(uri);
    if (!node) return;

    node.state = state;
    if (error !== undefined) {
      node.error = error;
    } else {
      delete node.error;
    }

    this.notify({ added: [], removed: [], updated: [node] });
  }

  public expandNode(uri: URI): void {
    this._expandedNodeUris.add(uri.toString());
    const node = this.getNode(uri);
    if (node && node.state === "collapsed") {
      // Transition to loading, expects someone to call setChildren
      this.setNodeState(uri, "loading");
    }
  }

  public collapseNode(uri: URI): void {
    this._expandedNodeUris.delete(uri.toString());
    this.setNodeState(uri, "collapsed");
  }

  public isExpanded(uri: URI): boolean {
    return this._expandedNodeUris.has(uri.toString());
  }

  public selectNode(uri: URI, multi: boolean = false): void {
    if (!multi) {
      this._selectedNodeUris.clear();
    }
    this._selectedNodeUris.add(uri.toString());
    this.notify({ added: [], removed: [], updated: [this.getNode(uri)!].filter(Boolean) });
  }

  public getSelectedNodeIds(): string[] {
    return Array.from(this._selectedNodeUris);
  }

  public getExpandedCount(): number {
    return this._expandedNodeUris.size;
  }

  public getTotalNodeCount(): number {
    return this._nodes.size;
  }

  public removeNode(uriStr: string): void {
    const node = this._nodes.get(uriStr);
    if (!node) return;
    this.unregisterNodeAndDescendants(node);

    // Also remove from roots if it's a root
    this._roots = this._roots.filter((r) => r.uri.toString() !== uriStr);

    // Also remove from parent if we had parent references, but in VirtualTreeModel parents aren't strictly tracked by node object right now, except we'd have to find it in the children array of its parent.
    // For simplicity, we just delete it from _nodes. When the parent is refreshed, it will be gone anyway.

    this.notify({ added: [], removed: [node.uri], updated: [] });
  }

  private unregisterNodeAndDescendants(node: ExplorerNode) {
    this._nodes.delete(node.uri.toString());
    this._expandedNodeUris.delete(node.uri.toString());
    this._selectedNodeUris.delete(node.uri.toString());

    if (node.children) {
      for (const child of node.children) {
        this.unregisterNodeAndDescendants(child);
      }
    }
  }

  public getVisibleNodes(): VisibleNode[] {
    const visible: VisibleNode[] = [];
    for (const root of this._roots) {
      this.flatten(root, 0, visible);
    }
    return visible;
  }

  private flatten(node: ExplorerNode, depth: number, result: VisibleNode[]) {
    const isExpanded = this._expandedNodeUris.has(node.uri.toString());
    const isSelected = this._selectedNodeUris.has(node.uri.toString());

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

  public onTreeChanged(listener: (change: TreeChange) => void): { dispose: () => void } {
    this._listeners.add(listener);
    return {
      dispose: () => {
        this._listeners.delete(listener);
      }
    };
  }

  private notify(change: TreeChange): void {
    for (const listener of this._listeners) {
      try {
        listener(change);
      } catch (e) {
        console.error("Error in tree listener", e);
      }
    }
  }
}
