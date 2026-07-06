import { URI, ResourceType } from "@ocs/common";
import type { IResourceService, Resource, ResourceChange } from "@ocs/common";
import type { IFileSystem } from "../infrastructure/IFileSystem.js";
import type { CancellationToken } from "@ocs/common";

export class ResourceService implements IResourceService {
  private _listeners: Set<(e: ResourceChange | ResourceChange[]) => void> = new Set();

  constructor(private readonly fs: IFileSystem) {}

  async getResource(uri: URI): Promise<Resource> {
    const stat = await this.fs.stat(uri.path);
    return {
      uri,
      type: stat.isDirectory ? ResourceType.Folder : ResourceType.File,
      name: uri.path.split("/").pop() || "",
      isReadonly: false, // Default for now
      size: stat.sizeBytes,
      mtime: stat.mtimeMs
    };
  }

  async getChildren(uri: URI, token?: CancellationToken): Promise<Resource[]> {
    if (token?.isCancellationRequested) return [];

    const entries = await this.fs.readDirectory(uri.path);
    if (token?.isCancellationRequested) return [];

    return entries.map((entry) => ({
      uri: URI.parse(`file://${uri.path}/${entry.name}`.replace(/(?<!:)\/\//g, "/")),
      type: entry.isDirectory ? ResourceType.Folder : ResourceType.File,
      name: entry.name,
      isReadonly: false
    }));
  }

  canRename(_uri: URI): boolean {
    return true; // Virtual capabilities can be configured here
  }

  canDelete(_uri: URI): boolean {
    return true;
  }

  canMove(_uri: URI): boolean {
    return true;
  }

  canCopy(_uri: URI): boolean {
    return true;
  }

  onResourceChanged(listener: (e: ResourceChange | ResourceChange[]) => void): {
    dispose: () => void;
  } {
    this._listeners.add(listener);
    return {
      dispose: () => {
        this._listeners.delete(listener);
      }
    };
  }

  public notifyResourceChanged(e: ResourceChange | ResourceChange[]): void {
    for (const listener of this._listeners) {
      try {
        listener(e);
      } catch (error) {
        console.error("Error in resource listener", error);
      }
    }
  }
}
