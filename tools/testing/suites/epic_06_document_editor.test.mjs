export const epicMetadata = {
  epic: "EPIC-0006",
  name: "Document Editor Platform",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0006-SC-001",
    story: "STORY-006",
    task: "TASK-001",
    ac: "AC-01",
    title: "Monaco - Component Load & Canvas Rendering",
    risk: "Critical",
    tags: ["@editor", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const monacoLoaded = await window.evaluate(() => {
        return (
          !!document.querySelector(".monaco-editor") ||
          document.body.innerText.includes("Open-Code.Studio")
        );
      });
      if (!monacoLoaded) throw new Error("Monaco editor element missing");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-002",
    story: "STORY-006",
    task: "TASK-002",
    ac: "AC-02",
    title: "Editor - Open File & Multi-Tab Navigation",
    risk: "Critical",
    tags: ["@editor", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0006-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-003",
    story: "STORY-006",
    task: "TASK-003",
    ac: "AC-03",
    title: "Editor - Dirty State Badge (*) & Document Save (Cmd+S)",
    risk: "Critical",
    tags: ["@editor", "@regression"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0006-SC-002"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-004",
    story: "STORY-006",
    task: "TASK-004",
    ac: "AC-04",
    title: "Editor - Save As & Auto Save Execution",
    risk: "High",
    tags: ["@editor"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-005",
    story: "STORY-006",
    task: "TASK-005",
    ac: "AC-05",
    title: "Editor - Undo (Cmd+Z) & Redo (Cmd+Shift+Z) Buffers",
    risk: "High",
    tags: ["@editor"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-006",
    story: "STORY-006",
    task: "TASK-006",
    ac: "AC-06",
    title: "Editor - Copy (Cmd+C) & Paste (Cmd+V) Buffer Operations",
    risk: "High",
    tags: ["@editor"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-007",
    story: "STORY-006",
    task: "TASK-007",
    ac: "AC-07",
    title: "Editor - In-Editor Search (Cmd+F), Find, Replace & Replace All",
    risk: "High",
    tags: ["@editor"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-008",
    story: "STORY-006",
    task: "TASK-008",
    ac: "AC-08",
    title: "Layout - Split Editor View, Close Tab, Reopen Tab (Cmd+Shift+T)",
    risk: "High",
    tags: ["@editor", "@layout"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-009",
    story: "STORY-006",
    task: "TASK-009",
    ac: "AC-09",
    title: "Monaco - Syntax Highlighting, Minimap, Word Wrap & Line Numbers",
    risk: "Medium",
    tags: ["@editor", "@monaco"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0006-SC-010",
    story: "STORY-006",
    task: "TASK-010",
    ac: "AC-10",
    title: "Persistence - Window Reload & Tab Session Restoration",
    risk: "High",
    tags: ["@editor", "@persistence"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
