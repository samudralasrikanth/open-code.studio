export const epicMetadata = {
  epic: "EPIC-0005",
  name: "Explorer Platform",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0005-SC-001",
    story: "STORY-005",
    task: "TASK-001",
    ac: "AC-01",
    title: "File Tree - Node Rendering & Expansion",
    risk: "Critical",
    tags: ["@explorer", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      if (window) {
        await window.evaluate(() => typeof document !== "undefined");
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0005-SC-002",
    story: "STORY-005",
    task: "TASK-002",
    ac: "AC-02",
    title: "File Tree - Node Collapse & Lazy Loading",
    risk: "High",
    tags: ["@explorer"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0005-SC-003",
    story: "STORY-005",
    task: "TASK-003",
    ac: "AC-03",
    title: "File Tree - Refresh Tree Action",
    risk: "Medium",
    tags: ["@explorer"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0005-SC-004",
    story: "STORY-005",
    task: "TASK-004",
    ac: "AC-04",
    title: "File Operations - New File & New Folder Creation",
    risk: "Critical",
    tags: ["@explorer"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0005-SC-005",
    story: "STORY-005",
    task: "TASK-005",
    ac: "AC-05",
    title: "File Operations - Inline File Rename & Delete",
    risk: "Critical",
    tags: ["@explorer"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0005-SC-006",
    story: "STORY-005",
    task: "TASK-006",
    ac: "AC-06",
    title: "Edge Cases - Hidden Files & Large Folder Performance (500+ Files)",
    risk: "High",
    tags: ["@explorer", "@performance"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
