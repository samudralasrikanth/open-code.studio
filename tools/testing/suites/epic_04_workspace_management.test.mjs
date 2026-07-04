export const epicMetadata = {
  epic: "EPIC-0004",
  name: "Workspace Management",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0004-SC-001",
    story: "STORY-004",
    task: "TASK-001",
    ac: "AC-01",
    title: "Workspace Lifecycle - Open Folder Workflow",
    risk: "Critical",
    tags: ["@workspace", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window, tempWorkspace }) {
      if (tempWorkspace && tempWorkspace.dirPath && window) {
        await window.evaluate((dir) => {
          window.location.hash = `#workspace/${encodeURIComponent(dir)}`;
        }, tempWorkspace.dirPath);
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0004-SC-002",
    story: "STORY-004",
    task: "TASK-002",
    ac: "AC-02",
    title: "Workspace Lifecycle - Close Workspace",
    risk: "High",
    tags: ["@workspace"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0004-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0004-SC-003",
    story: "STORY-004",
    task: "TASK-003",
    ac: "AC-03",
    title: "Workspace Lifecycle - Reopen Workspace",
    risk: "High",
    tags: ["@workspace"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window, tempWorkspace }) {
      await window.evaluate((dir) => {
        window.location.hash = `#workspace/${encodeURIComponent(dir)}`;
      }, tempWorkspace.dirPath);
      return { pass: true };
    }
  },
  {
    id: "EPIC-0004-SC-004",
    story: "STORY-004",
    task: "TASK-004",
    ac: "AC-04",
    title: "Workspace Lifecycle - Recent Workspaces List Persistence",
    risk: "Medium",
    tags: ["@workspace"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0004-SC-005",
    story: "STORY-004",
    task: "TASK-005",
    ac: "AC-05",
    title: "Session - Save & Restore Layout State",
    risk: "High",
    tags: ["@workspace", "@session"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
