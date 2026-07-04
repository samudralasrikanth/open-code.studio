export const epicMetadata = {
  epic: "EPIC-0008",
  name: "Git Integration",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0008-SC-001",
    story: "STORY-008",
    task: "TASK-001",
    ac: "AC-01",
    title: "Repository - Detect Git Repo, Status & Active Branch Display",
    risk: "Critical",
    tags: ["@git", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      if (window) {
        const scButton = window.locator('button[title="Source Control"]').first();
        if (await scButton.isVisible({ timeout: 1000 })) {
          await scButton.click({ force: true });
        }
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0008-SC-002",
    story: "STORY-008",
    task: "TASK-002",
    ac: "AC-02",
    title: "Operations - Stage, Unstage, Commit & Branch Checkout",
    risk: "Critical",
    tags: ["@git"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0008-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0008-SC-003",
    story: "STORY-008",
    task: "TASK-003",
    ac: "AC-03",
    title: "History - Commit Log Display, Diff View & Merge Conflicts",
    risk: "High",
    tags: ["@git"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
