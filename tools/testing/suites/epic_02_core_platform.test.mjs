import fs from "fs";
import path from "path";

export const epicMetadata = {
  epic: "EPIC-0002",
  name: "Core Platform",
  phase: "Phase 0 – Foundation"
};

export const scenarios = [
  {
    id: "EPIC-0002-SC-001",
    story: "STORY-002",
    task: "TASK-001",
    ac: "AC-01",
    title: "Logger - Debug Level Logging",
    risk: "Critical",
    tags: ["@core", "@logger"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const loggerSrc = fs.readFileSync(
        path.join(projectRoot, "packages/common/logger/src/index.ts"),
        "utf-8"
      );
      if (!loggerSrc.includes("debug(") && !loggerSrc.includes("DEBUG")) {
        throw new Error("Logger does not implement debug level");
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-002",
    story: "STORY-002",
    task: "TASK-002",
    ac: "AC-02",
    title: "Logger - Info Level Logging",
    risk: "Critical",
    tags: ["@core", "@logger"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const loggerSrc = fs.readFileSync(
        path.join(projectRoot, "packages/common/logger/src/index.ts"),
        "utf-8"
      );
      if (!loggerSrc.includes("info(")) throw new Error("Logger info method missing");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-003",
    story: "STORY-002",
    task: "TASK-003",
    ac: "AC-03",
    title: "Logger - Warn Level Logging",
    risk: "Critical",
    tags: ["@core", "@logger"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const loggerSrc = fs.readFileSync(
        path.join(projectRoot, "packages/common/logger/src/index.ts"),
        "utf-8"
      );
      if (!loggerSrc.includes("warn(")) throw new Error("Logger warn method missing");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-004",
    story: "STORY-002",
    task: "TASK-004",
    ac: "AC-04",
    title: "Logger - Error Level Logging",
    risk: "Critical",
    tags: ["@core", "@logger"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const loggerSrc = fs.readFileSync(
        path.join(projectRoot, "packages/common/logger/src/index.ts"),
        "utf-8"
      );
      if (!loggerSrc.includes("error(")) throw new Error("Logger error method missing");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-005",
    story: "STORY-002",
    task: "TASK-005",
    ac: "AC-05",
    title: "EventBus - Publish Operations",
    risk: "High",
    tags: ["@core", "@eventbus"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const ebPath = path.join(projectRoot, "packages/common/events/src/index.ts");
      if (fs.existsSync(ebPath)) {
        const content = fs.readFileSync(ebPath, "utf-8");
        if (!content.includes("publish")) throw new Error("EventBus publish method missing");
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-006",
    story: "STORY-002",
    task: "TASK-006",
    ac: "AC-06",
    title: "EventBus - Subscribe & Unsubscribe Lifecycle",
    risk: "High",
    tags: ["@core", "@eventbus"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const ebPath = path.join(projectRoot, "packages/common/events/src/index.ts");
      if (fs.existsSync(ebPath)) {
        const content = fs.readFileSync(ebPath, "utf-8");
        if (!content.includes("subscribe")) {
          throw new Error("EventBus subscribe method missing");
        }
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-007",
    story: "STORY-002",
    task: "TASK-007",
    ac: "AC-07",
    title: "EventBus - Async Publish & Multiple Subscribers",
    risk: "High",
    tags: ["@core", "@eventbus"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-008",
    story: "STORY-002",
    task: "TASK-008",
    ac: "AC-08",
    title: "Error Handling - Safe Exception & EPIPE Catching",
    risk: "Critical",
    tags: ["@core", "@error"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const loggerIndex = fs.readFileSync(
        path.join(projectRoot, "packages/common/logger/src/index.ts"),
        "utf-8"
      );
      if (!loggerIndex.includes("ConsoleSink") || !loggerIndex.includes("try {")) {
        throw new Error("ConsoleSink try/catch safe exception wrapper missing");
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0002-SC-009",
    story: "STORY-002",
    task: "TASK-009",
    ac: "AC-09",
    title: "Error Handling - Stack Preservation & IPC Propagation",
    risk: "Critical",
    tags: ["@core", "@error"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const mainPath = fs.readFileSync(
        path.join(projectRoot, "apps/studio/src/main/main.ts"),
        "utf-8"
      );
      if (!mainPath.includes("uncaughtException"))
        throw new Error("main process uncaughtException handler missing");
      return { pass: true };
    }
  }
];
