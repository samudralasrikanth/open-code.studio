/* eslint-disable */

import { ExplorerService, VirtualTreeModel } from "@ocs/explorer";
import { URI } from "@ocs/common";
import { describe, expect, it, beforeEach } from "vitest";

const mockWorkspaceService = {
  getTree: () => ({ roots: [{ uri: URI.parse("file:///mock/root"), name: "root" }] })
};

const mockResourceService = {
  getChildren: async () => [
    { uri: URI.parse("file:///mock/root/child1"), name: "child1", type: 1 }
  ],
  canRename: () => true,
  canDelete: () => true,
  canMove: () => true,
  canCopy: () => true
};

describe("Integration: Explorer Refresh", () => {
  let explorerService: ExplorerService;

  beforeEach(() => {
    explorerService = new ExplorerService(mockWorkspaceService as any, mockResourceService as any);
  });

  it("should successfully refresh the root node", () => {
    explorerService.refreshRoots();

    const rootNodes = explorerService.treeModel.getRoots();
    expect(rootNodes).toHaveLength(1);
    expect(rootNodes[0].name).toBe("root");
  });

  it("should successfully expand a node", async () => {
    explorerService.refreshRoots();
    const rootNodes = explorerService.treeModel.getRoots();

    await explorerService.expandNode(rootNodes[0].uri);

    const updatedNodes = explorerService.treeModel.getVisibleNodes();
    expect(updatedNodes).toHaveLength(2); // root + child
    expect(updatedNodes[1].node.name).toBe("child1");
  });
});
