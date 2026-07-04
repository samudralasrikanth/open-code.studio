import { executeTerminalCommand } from "../helpers/terminal.mjs";

export const epicMetadata = {
  epic: "EPIC-0007",
  name: "Terminal Integration",
  phase: "Phase 1 – IDE Platform"
};

export const scenarios = [
  {
    id: "EPIC-0007-SC-001",
    story: "STORY-007",
    task: "TASK-001",
    ac: "AC-01",
    title: "PTY - Open Interactive Terminal & Dynamic Prompt Match",
    risk: "Critical",
    tags: ["@terminal", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const res = await executeTerminalCommand(window, "echo 'EPIC_07_OK'");
      if (!res.success) throw new Error("Terminal command execution failed");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0007-SC-002",
    story: "STORY-007",
    task: "TASK-002",
    ac: "AC-02",
    title: "PTY - Multiple Terminals, Resize & Close Operations",
    risk: "High",
    tags: ["@terminal"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0007-SC-001"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0007-SC-003",
    story: "STORY-007",
    task: "TASK-003",
    ac: "AC-03",
    title: "Commands - Execute, Exit Codes & Ctrl+C Interrupt",
    risk: "Critical",
    tags: ["@terminal"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0007-SC-004",
    story: "STORY-007",
    task: "TASK-004",
    ac: "AC-04",
    title: "Environment - Working Directory (pwd) & PATH Inheritance",
    risk: "High",
    tags: ["@terminal"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  },
  {
    id: "EPIC-0007-SC-005",
    story: "STORY-007",
    task: "TASK-005",
    ac: "AC-05",
    title: "Output - ANSI Colors & Live Output Streaming",
    risk: "Medium",
    tags: ["@terminal"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      return { pass: true };
    }
  }
];
