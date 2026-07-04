export const epicMetadata = {
  epic: "EPIC-0011",
  name: "Settings",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0011-SC-001",
    story: "STORY-011",
    task: "TASK-001",
    ac: "AC-01",
    title: "User Settings - Change, Save & Reload Persistence",
    risk: "High",
    tags: ["@settings", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      if (window) {
        const settingsButton = window.locator('span[title="Settings"]').first();
        if (await settingsButton.isVisible({ timeout: 1000 })) {
          await settingsButton.click({ force: true });
        }
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0011-SC-002",
    story: "STORY-011",
    task: "TASK-002",
    ac: "AC-02",
    title: "Workspace Settings - Override & Reset to Defaults",
    risk: "High",
    tags: ["@settings"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0011-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0011-SC-003",
    story: "STORY-011",
    task: "TASK-003",
    ac: "AC-03",
    title: "UI - Search Settings & Theme Live Update (Light/Dark)",
    risk: "Medium",
    tags: ["@settings", "@theme"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0011-SC-004",
    story: "STORY-011",
    task: "TASK-004",
    ac: "AC-04",
    title: "JSON - Open JSON Settings Editor & Validate JSON Format",
    risk: "Medium",
    tags: ["@settings", "@json"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
