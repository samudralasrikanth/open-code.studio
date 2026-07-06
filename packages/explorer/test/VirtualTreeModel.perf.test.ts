import { expect, test, describe } from "vitest";
import { URI } from "@ocs/common";
import { VirtualTreeModel, ExplorerNode } from "../src/domain/VirtualTreeModel.js";

describe("VirtualTreeModel Performance", () => {
  test("should expand 100k nodes in under 2 seconds", () => {
    const model = new VirtualTreeModel();
    const rootUri = URI.parse("file:///root");

    model.setRoots([
      {
        uri: rootUri,
        name: "root",
        isDirectory: true,
        state: "collapsed",
        capabilities: {
          canRename: true,
          canDelete: true,
          canMove: true,
          canCopy: true,
          canDrop: true
        }
      }
    ]);

    model.expandNode(rootUri);

    const children: ExplorerNode[] = [];
    for (let i = 0; i < 100000; i++) {
      children.push({
        uri: URI.parse(`file:///root/child${i}`),
        name: `child${i}`,
        isDirectory: false,
        state: "loaded",
        capabilities: {
          canRename: true,
          canDelete: true,
          canMove: true,
          canCopy: true,
          canDrop: false
        }
      });
    }

    const start = performance.now();
    model.setChildren(rootUri, children);
    const end = performance.now();

    expect(end - start).toBeLessThan(2000);
    expect(model.getNode(rootUri)?.children).toHaveLength(100000);
  });
});
