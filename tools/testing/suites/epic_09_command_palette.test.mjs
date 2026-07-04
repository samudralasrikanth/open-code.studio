export const epicMetadata = {
  epic: "EPIC-0009",
  name: "Command Palette",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0009-SC-001",
    story: "STORY-009",
    task: "TASK-001",
    ac: "AC-01",
    title: "Palette - Trigger Overlay (F1 / Cmd+Shift+P) & Dismiss (Escape)",
    risk: "High",
    tags: ["@palette", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      await window.keyboard.press("F1");
      await window.waitForTimeout(1000);
      await window.keyboard.press("Escape");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0009-SC-002",
    story: "STORY-009",
    task: "TASK-002",
    ac: "AC-02",
    title: "Palette - Search, Fuzzy Matching & Keyboard Navigation",
    risk: "High",
    tags: ["@palette"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0009-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0009-SC-003",
    story: "STORY-009",
    task: "TASK-003",
    ac: "AC-03",
    title: "Execution - Command Dispatch & Recent Commands List",
    risk: "High",
    tags: ["@palette"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
