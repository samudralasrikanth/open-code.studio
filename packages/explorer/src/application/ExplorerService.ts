import type { WorkspaceService } from "@ocs/workspace";
import type { IResourceService } from "@ocs/common";
import { URI } from "@ocs/common";
import { VirtualTreeModel } from "../domain/VirtualTreeModel.js";
import type { ExplorerNode } from "../domain/VirtualTreeModel.js";

export class ExplorerService {
  public readonly treeModel: VirtualTreeModel;

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly resourceService: IResourceService
  ) {
    this.treeModel = new VirtualTreeModel();
    this.initialize();
  }

  private initialize(): void {
    // When a workspace tree changes, we rebuild the Explorer roots
    // For this simple version, we'll initialize directly.
    // Real implementation would listen to WorkspaceService events.
    this.refreshRoots();
  }

  public refreshRoots(): void {
    const wsTree = this.workspaceService.getTree();
    const newRoots = wsTree.roots.map((root: any) =>
      this.createExplorerNode(root.uri, root.name, true)
    );
    this.treeModel.setRoots(newRoots);
  }

  public async expandNode(uri: URI): Promise<void> {
    const node = this.treeModel.getNode(uri);
    if (!node || !node.isDirectory) return;

    if (node.state === "collapsed" || node.state === "error") {
      this.treeModel.expandNode(uri);
      try {
        const resources = await this.resourceService.getChildren(uri);
        const children = resources.map((res) =>
          this.createExplorerNode(res.uri, res.name, res.type === 2)
        );
        this.treeModel.setChildren(uri, children);
      } catch (err) {
        this.treeModel.setNodeState(
          uri,
          "error",
          err instanceof Error ? err : new Error(String(err))
        );
      }
    } else if (node.state === "loaded") {
      // Just mark it as expanded if already loaded
      this.treeModel.expandNode(uri);
    }
  }

  public collapseNode(uri: URI): void {
    this.treeModel.collapseNode(uri);
  }

  public selectNode(uri: URI, multi: boolean = false): void {
    this.treeModel.selectNode(uri, multi);
  }

  private createExplorerNode(uri: URI, name: string, isDirectory: boolean): ExplorerNode {
    return {
      uri,
      name,
      isDirectory,
      state: "collapsed",
      capabilities: {
        canRename: this.resourceService.canRename(uri),
        canDelete: this.resourceService.canDelete(uri),
        canMove: this.resourceService.canMove(uri),
        canCopy: this.resourceService.canCopy(uri),
        canDrop: isDirectory // Only folders can accept drops generally
      }
    };
  }
}
