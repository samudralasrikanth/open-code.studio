import type { WorkspaceUri } from "@ocs/workspace";
import { uriToPath, uriFromString } from "@ocs/workspace";

import type { ExplorerNode } from "../domain/TreeModel.js";
import { FileType, type IVirtualFileSystem } from "../domain/VirtualFileSystem.js";

import type { ExplorerProvider } from "./ExplorerProvider.js";

export class WorkspaceProvider implements ExplorerProvider {
  public readonly id = "explorer.provider.workspace";

  private rootUri: WorkspaceUri | null = null;

  constructor(private vfs: IVirtualFileSystem) {}

  public setRoot(uri: WorkspaceUri) {
    this.rootUri = uri;
  }

  public async resolveChildren(node: ExplorerNode | null): Promise<ExplorerNode[]> {
    if (node === null) {
      if (!this.rootUri) return [];
      // Return the root node
      const stat = await this.vfs.stat(this.rootUri);
      return [
        {
          id: this.rootUri.toString(),
          name: uriToPath(this.rootUri).split("/").pop() || "Workspace",
          uri: this.rootUri,
          type: stat.type,
          isDirectory: stat.type === FileType.Directory
        }
      ];
    }

    if (!node.isDirectory || !node.uri) {
      return [];
    }

    const entries = await this.vfs.readDirectory(node.uri);
    return entries.map(([name, type]) => {
      const childUri = uriFromString(`${node.uri!.toString()}/${name}`);
      return {
        id: childUri.toString(),
        name,
        uri: childUri,
        type,
        isDirectory: type === FileType.Directory,
        parentId: node.id
      };
    });
  }
}
