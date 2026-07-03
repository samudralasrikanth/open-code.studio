/* eslint-disable */

import { ExplorerService, TreeModel, ExplorerEventBus } from "@ocs/explorer";
import type { ExplorerProvider, ExplorerNode } from "@ocs/explorer";
import { describe, expect, it, beforeEach } from "vitest";

// A mock provider for testing
class MockExplorerProvider implements ExplorerProvider {
  public id = "mock.provider";

  async resolveChildren(node: ExplorerNode | null): Promise<ExplorerNode[]> {
    if (!node) {
      // Root level
      return [
        {
          id: "root-1",
          name: "root-1",
          isDirectory: true,
          metadata: {}
        }
      ];
    }

    if (node.id === "root-1") {
      return [
        {
          id: "child-1",
          name: "child-1.txt",
          isDirectory: false,
          metadata: {}
        }
      ];
    }

    return [];
  }
}

describe("Integration: Explorer Refresh", () => {
  let treeModel: TreeModel;
  let eventBus: ExplorerEventBus;
  let explorerService: ExplorerService;
  let provider: MockExplorerProvider;

  beforeEach(() => {
    treeModel = new TreeModel();
    eventBus = new ExplorerEventBus();
    explorerService = new ExplorerService(treeModel, eventBus);

    provider = new MockExplorerProvider();
    explorerService.registerProvider(provider);
  });

  it("should successfully refresh the root node", async () => {
    const startedEvents: any[] = [];
    const completedEvents: any[] = [];

    eventBus.on("explorer.refreshStarted", (e) => startedEvents.push(e));
    eventBus.on("explorer.refreshCompleted", (e) => completedEvents.push(e));

    await explorerService.refresh("mock.provider", null);

    const rootId = treeModel.getRootId();
    expect(rootId).toBe("root-1");

    const rootNode = treeModel.getNode("root-1");
    expect(rootNode).toBeDefined();
    expect(rootNode?.isDirectory).toBe(true);

    expect(startedEvents).toHaveLength(1);
    expect(completedEvents).toHaveLength(1);
  });

  it("should successfully expand a node", async () => {
    await explorerService.refresh("mock.provider", null);
    await explorerService.expandNode("mock.provider", "root-1");

    const rootNode = treeModel.getNode("root-1");
    expect(rootNode?.children).toBeDefined();
    expect(rootNode?.children).toHaveLength(1);
    expect(rootNode?.children?.[0].id).toBe("child-1");

    const childNode = treeModel.getNode("child-1");
    expect(childNode).toBeDefined();
    expect(childNode?.name).toBe("child-1.txt");
    expect(treeModel.isExpanded("root-1")).toBe(true);
  });
});
