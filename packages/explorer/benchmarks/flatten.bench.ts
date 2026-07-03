import { uriFromString } from "@ocs/workspace";
import { bench, describe } from "vitest";

import { TreeModel, type ExplorerNode } from "../src/domain/TreeModel.js";
import { FileType } from "../src/domain/VirtualFileSystem.js";

function generateTree(depth: number, breadth: number, currentId = "root"): ExplorerNode {
  const node: ExplorerNode = {
    id: currentId,
    name: `Node ${currentId}`,
    uri: uriFromString(`file:///${currentId}`),
    type: FileType.Directory,
    isDirectory: true,
    children: []
  };

  if (depth > 0) {
    for (let i = 0; i < breadth; i++) {
      const childId = `${currentId}-${i}`;
      node.children!.push(generateTree(depth - 1, breadth, childId));
    }
  } else {
    // Leaf nodes are files
    node.isDirectory = false;
    node.type = FileType.File;
    delete node.children;
  }

  return node;
}

// Generate trees of varying sizes
// Depth 3, Breadth 22 ~ 10,000 files
const tree10k = generateTree(3, 22);

// Depth 4, Breadth 15 ~ 50,000 files
const tree50k = generateTree(4, 15);

// Depth 4, Breadth 18 ~ 100,000 files
const tree100k = generateTree(4, 18);

// Depth 4, Breadth 23 ~ 250,000 files
const tree250k = generateTree(4, 23);

describe("Explorer Tree Flattening (getVisibleNodes)", () => {
  bench("Flatten 10,000 nodes", () => {
    const model = new TreeModel();
    model.setRoot(tree10k);

    // Expand root to force flattening of at least first level
    model.expand("root");
    model.getVisibleNodes();
  });

  bench("Flatten 50,000 nodes", () => {
    const model = new TreeModel();
    model.setRoot(tree50k);

    model.expand("root");
    model.getVisibleNodes();
  });

  bench("Flatten 100,000 nodes", () => {
    const model = new TreeModel();
    model.setRoot(tree100k);

    model.expand("root");
    model.getVisibleNodes();
  });

  bench("Flatten 250,000 nodes", () => {
    const model = new TreeModel();
    model.setRoot(tree250k);

    model.expand("root");
    model.getVisibleNodes();
  });
});
