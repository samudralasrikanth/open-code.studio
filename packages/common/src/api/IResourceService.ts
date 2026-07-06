import type { URI } from "../domain/URI.js";
import type { Resource, ResourceChange } from "../domain/Resource.js";
import type { CancellationToken } from "../domain/CancellationToken.js";

export interface IResourceService {
  getResource(uri: URI): Promise<Resource>;
  getChildren(uri: URI, token?: CancellationToken): Promise<Resource[]>;

  canRename(uri: URI): boolean;
  canDelete(uri: URI): boolean;
  canMove(uri: URI): boolean;
  canCopy(uri: URI): boolean;

  onResourceChanged(listener: (e: ResourceChange | ResourceChange[]) => void): {
    dispose: () => void;
  };
}
