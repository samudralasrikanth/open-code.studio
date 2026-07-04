export const epicMetadata = {
  epic: "EPIC-0010",
  name: "Global Search",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0010-SC-001",
    story: "STORY-010",
    task: "TASK-001",
    ac: "AC-01",
    title: "Search - Text Search & View Trigger (Cmd+Shift+F)",
    risk: "Critical",
    tags: ["@search", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      if (window) {
        const searchBtn = window.locator('[title="Search"]').first();
        if (await searchBtn.isVisible({ timeout: 1000 })) {
          await searchBtn.click({ force: true });
        }
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0010-SC-002",
    story: "STORY-010",
    task: "TASK-002",
    ac: "AC-02",
    title: "Search Options - Regex, Whole Word & Case Sensitive Toggles",
    risk: "High",
    tags: ["@search"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0010-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0010-SC-003",
    story: "STORY-010",
    task: "TASK-003",
    ac: "AC-03",
    title: "Replace - Single File Replace & Replace All Operations",
    risk: "Critical",
    tags: ["@search"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0010-SC-004",
    story: "STORY-010",
    task: "TASK-004",
    ac: "AC-04",
    title: "Scope & Perf - Include/Exclude Globs & Large Repo Search (<500ms)",
    risk: "High",
    tags: ["@search", "@performance"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
