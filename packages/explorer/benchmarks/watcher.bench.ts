import { bench, describe } from "vitest";

import { ExplorerScheduler } from "../src/application/ExplorerScheduler.js";
import { TreeModel } from "../src/domain/TreeModel.js";
import { ExplorerEventBus } from "../src/events/ExplorerEventBus.js";

describe("ExplorerScheduler Batching", () => {
  bench("Schedule 5000 watcher events", () => {
    const treeModel = new TreeModel();
    const eventBus = new ExplorerEventBus();
    const scheduler = new ExplorerScheduler(treeModel, eventBus);

    for (let i = 0; i < 5000; i++) {
      scheduler.scheduleUpdate("explorer.refreshCompleted");
    }
  });

  bench("Schedule 10,000 watcher events", () => {
    const treeModel = new TreeModel();
    const eventBus = new ExplorerEventBus();
    const scheduler = new ExplorerScheduler(treeModel, eventBus);

    for (let i = 0; i < 10000; i++) {
      scheduler.scheduleUpdate("explorer.refreshCompleted");
    }
  });
});
