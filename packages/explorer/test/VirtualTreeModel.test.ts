import { expect, test, describe } from "vitest";
import { URI } from "@ocs/common";
import { VirtualTreeModel, ExplorerNode } from "../src/domain/VirtualTreeModel.js";

describe("VirtualTreeModel", () => {
  test("should set roots correctly", () => {
    const model = new VirtualTreeModel();
    const roots: ExplorerNode[] = [
      {
        uri: URI.parse("file:///root1"),
        name: "root1",
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
    ];

    let fired = false;
    model.onTreeChanged((change) => {
      fired = true;
      expect(change.added).toHaveLength(1);
    });

    model.setRoots(roots);
    expect(model.getRoots()).toHaveLength(1);
    expect(model.getNode(URI.parse("file:///root1"))).toBeDefined();
    expect(fired).toBe(true);
  });

  test("should handle expand and setChildren", () => {
    const model = new VirtualTreeModel();
    const rootUri = URI.parse("file:///root");
    const childUri = URI.parse("file:///root/child");

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

    expect(model.isExpanded(rootUri)).toBe(false);

    model.expandNode(rootUri);
    expect(model.isExpanded(rootUri)).toBe(true);
    expect(model.getNode(rootUri)?.state).toBe("loading");

    model.setChildren(rootUri, [
      {
        uri: childUri,
        name: "child",
        isDirectory: false,
        state: "loaded",
        capabilities: {
          canRename: true,
          canDelete: true,
          canMove: true,
          canCopy: true,
          canDrop: false
        }
      }
    ]);

    const root = model.getNode(rootUri);
    expect(root?.state).toBe("loaded");
    expect(root?.children).toHaveLength(1);
    expect(model.getNode(childUri)).toBeDefined();
  });
});
