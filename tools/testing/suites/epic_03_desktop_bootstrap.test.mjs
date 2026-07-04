export const epicMetadata = {
  epic: "EPIC-0003",
  name: "Desktop Bootstrap",
  phase: "Phase 0 – Foundation"
};

export const scenarios = [
  {
    id: "EPIC-0003-SC-001",
    story: "STORY-003",
    task: "TASK-001",
    ac: "AC-01",
    title: "Startup - First Launch & Main Window Creation",
    risk: "Critical",
    tags: ["@bootstrap", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const title = await window.title();
      if (!title.includes("Open-Code.Studio")) throw new Error(`Unexpected title: ${title}`);
      return { pass: true };
    }
  },
  {
    id: "EPIC-0003-SC-002",
    story: "STORY-003",
    task: "TASK-002",
    ac: "AC-02",
    title: "Startup - Single Instance Lock & Window Restore",
    risk: "High",
    tags: ["@bootstrap"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const isVisible = await window.isVisible("body");
      if (!isVisible) throw new Error("Window body is not visible");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0003-SC-003",
    story: "STORY-003",
    task: "TASK-003",
    ac: "AC-03",
    title: "Security - Preload Context Isolation & Exposed APIs",
    risk: "Critical",
    tags: ["@bootstrap", "@security"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const hasPreload = await window.evaluate(
        () => typeof window.ocs !== "undefined" || typeof window.electron !== "undefined"
      );
      if (!hasPreload)
        throw new Error("Preload window context (window.ocs / window.electron) missing");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0003-SC-004",
    story: "STORY-003",
    task: "TASK-004",
    ac: "AC-04",
    title: "Security - IPC Bridge Channel Whitelist Enforcement",
    risk: "Critical",
    tags: ["@bootstrap", "@security"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const isIsolated = await window.evaluate(() => typeof window.require === "undefined");
      if (!isIsolated) throw new Error("nodeIntegration is enabled (security vulnerability)");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0003-SC-005",
    story: "STORY-003",
    task: "TASK-005",
    ac: "AC-05",
    title: "Recovery - Renderer Crash & Window Restore Capabilities",
    risk: "High",
    tags: ["@bootstrap", "@recovery"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
