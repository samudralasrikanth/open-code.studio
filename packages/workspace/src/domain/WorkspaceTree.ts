import { URI } from "@ocs/common";

export interface WorkspaceNode {
  readonly uri: URI;
  readonly name: string;
  readonly isDirectory: boolean;
}

export interface WorkspaceTree {
  readonly roots: WorkspaceNode[];
  getNode(uri: URI): WorkspaceNode | undefined;
}

export class ImmutableWorkspaceTree implements WorkspaceTree {
  public readonly roots: WorkspaceNode[];

  constructor(roots: WorkspaceNode[]) {
    this.roots = [...roots];
  }

  getNode(uri: URI): WorkspaceNode | undefined {
    // Basic root-level lookup for now
    return this.roots.find((r) => r.uri.toString() === uri.toString());
  }
}
