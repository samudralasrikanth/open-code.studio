import * as path from "node:path";

import type { WorkspaceUri } from "@ocs/workspace";
import { uriFromPath, uriToPath } from "@ocs/workspace";

import type { TreeModel, ExplorerNode } from "../domain/TreeModel.js";
import type { IExplorerEventBus } from "../events/ExplorerEvents.js";
import type { ExplorerProvider } from "../providers/ExplorerProvider.js";

import type { FileWatchEvent } from "./FileWatcher.js";

/**
 * ExplorerService coordinates the providers, the tree model, and the event bus.
 */
export class ExplorerService {
  private providers: Map<string, ExplorerProvider> = new Map();

  constructor(
    public readonly treeModel: TreeModel,
    public readonly eventBus: IExplorerEventBus
  ) {}

  public registerProvider(provider: ExplorerProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider<TProvider extends ExplorerProvider = ExplorerProvider>(
    providerId: string
  ): TProvider | undefined {
    return this.providers.get(providerId) as TProvider | undefined;
  }

  public unregisterProvider(providerId: string) {
    this.providers.delete(providerId);
  }

  /**
   * Triggers a refresh for a specific provider.
   * If rootNodeId is not provided, it refreshes the root.
   */
  public async refresh(providerId: string, nodeId: string | null = null): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    this.eventBus.emit("explorer.refreshStarted", { providerId });

    try {
      let node: ExplorerNode | null = null;
      if (nodeId) {
        node = this.treeModel.getNode(nodeId) || null;
      }

      if (nodeId && !node) {
        return; // Node not found in tree model, nothing to refresh
      }

      const children = await provider.resolveChildren(node);

      if (node === null) {
        // If we resolved root and returned multiple, we might need a composite root.
        // For simplicity, assume a single root or wrap them.
        if (children.length === 1 && children[0]) {
          this.treeModel.setRoot(children[0]);
        }
      } else {
        this.treeModel.setChildren(node.id, children);
      }
    } finally {
      this.eventBus.emit("explorer.refreshCompleted", { providerId });
    }
  }

  /**
   * Expands a node and fetches children if necessary.
   */
  public async expandNode(providerId: string, nodeId: string): Promise<void> {
    const node = this.treeModel.getNode(nodeId);
    if (!node || !node.isDirectory) return;

    // If children are not loaded, load them
    if (node.children === undefined) {
      await this.refresh(providerId, nodeId);
    }

    this.treeModel.expand(nodeId);
    this.eventBus.emit("explorer.nodeExpanded", { nodeId });
  }

  public collapseNode(nodeId: string): void {
    this.treeModel.collapse(nodeId);
    this.eventBus.emit("explorer.nodeCollapsed", { nodeId });
  }

  public selectNode(nodeId: string, multi: boolean = false): void {
    this.treeModel.select(nodeId, multi);
    this.eventBus.emit("explorer.selectionChanged", {
      selectedNodeIds: [...this.treeModel.getSelectedNodeIds()]
    });
  }

  public getProviderId(): string {
    return "explorer.provider.workspace";
  }

  public async openWorkspaceRoot(): Promise<void> {
    const providerId = this.getProviderId();
    await this.refresh(providerId, null);
    const rootId = this.treeModel.getRootId();
    if (rootId) {
      await this.expandNode(providerId, rootId);
    }
  }

  public async handleFileWatchEvents(events: FileWatchEvent[]): Promise<void> {
    const providerId = this.getProviderId();
    const refreshedParents = new Set<string>();
    const rootId = this.treeModel.getRootId();
    if (!rootId) return;

    const rootPath = uriToPath(rootId as WorkspaceUri);

    for (const event of events) {
      const fsPath = uriToPath(event.uri);
      const parentPath = path.dirname(fsPath);
      const parentId = parentPath === rootPath ? rootId : uriFromPath(parentPath).toString();

      if (this.treeModel.getNode(parentId) && this.treeModel.isExpanded(parentId)) {
        refreshedParents.add(parentId);
      }
    }

    for (const parentId of refreshedParents) {
      await this.refresh(providerId, parentId);
    }

    if (refreshedParents.size > 0) {
      this.eventBus.emit("explorer.refreshCompleted", { providerId });
    }
  }
}
