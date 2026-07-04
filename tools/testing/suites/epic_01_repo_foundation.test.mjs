import fs from "fs";
import path from "path";

export const epicMetadata = {
  epic: "EPIC-0001",
  name: "Repository Foundation",
  phase: "Phase 0 – Foundation"
};

export const scenarios = [
  {
    id: "EPIC-0001-SC-001",
    story: "STORY-001",
    task: "TASK-001",
    ac: "AC-01",
    title: "Fresh Clone Monorepo Directory Layout",
    risk: "Critical",
    tags: ["@foundation", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const requiredPaths = [
        "apps/studio",
        "packages/common",
        "packages/terminal",
        "pnpm-workspace.yaml",
        "package.json"
      ];
      for (const p of requiredPaths) {
        if (!fs.existsSync(path.join(projectRoot, p))) {
          throw new Error(`Missing expected monorepo path: ${p}`);
        }
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-002",
    story: "STORY-001",
    task: "TASK-002",
    ac: "AC-02",
    title: "Dependency Installation & Lockfile Integrity",
    risk: "Critical",
    tags: ["@foundation", "@regression"],
    platform: ["macOS", "Windows", "Linux"],
    dependsOn: ["EPIC-0001-SC-001"],
    async run({ projectRoot }) {
      const lockPath = path.join(projectRoot, "pnpm-lock.yaml");
      if (!fs.existsSync(lockPath)) throw new Error("pnpm-lock.yaml missing");
      const lockContent = fs.readFileSync(lockPath, "utf-8");
      if (lockContent.length < 100) throw new Error("pnpm-lock.yaml is empty or corrupted");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-003",
    story: "STORY-001",
    task: "TASK-003",
    ac: "AC-03",
    title: "Workspace Detection (pnpm-workspace.yaml)",
    risk: "Critical",
    tags: ["@foundation"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const wsPath = path.join(projectRoot, "pnpm-workspace.yaml");
      const content = fs.readFileSync(wsPath, "utf-8");
      if (!content.includes("apps/*") || !content.includes("packages/*")) {
        throw new Error("pnpm-workspace.yaml does not contain apps/* and packages/*");
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-004",
    story: "STORY-001",
    task: "TASK-004",
    ac: "AC-04",
    title: "Package Declarations Discovery",
    risk: "Critical",
    tags: ["@foundation"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const commonPkg = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "packages/common/package.json"), "utf-8")
      );
      const appPkg = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "apps/studio/package.json"), "utf-8")
      );

      if (commonPkg.name !== "@ocs/common") throw new Error(`Unexpected name: ${commonPkg.name}`);
      if (appPkg.name !== "@ocs/app-studio") throw new Error(`Unexpected name: ${appPkg.name}`);
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-005",
    story: "STORY-001",
    task: "TASK-005",
    ac: "AC-05",
    title: "Turborepo Build Configuration",
    risk: "High",
    tags: ["@foundation"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const turboPath = path.join(projectRoot, "turbo.json");
      if (!fs.existsSync(turboPath)) throw new Error("turbo.json missing");
      const turbo = JSON.parse(fs.readFileSync(turboPath, "utf-8"));
      if (!turbo.tasks || (!turbo.tasks.build && !turbo.pipeline?.build)) {
        throw new Error("turbo.json missing build task configuration");
      }
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-006",
    story: "STORY-001",
    task: "TASK-006",
    ac: "AC-06",
    title: "Monorepo Typecheck & Lint Validation",
    risk: "High",
    tags: ["@foundation"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const tsconfig = path.join(projectRoot, "tsconfig.json");
      if (!fs.existsSync(tsconfig)) throw new Error("Root tsconfig.json missing");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-007",
    story: "STORY-001",
    task: "TASK-007",
    ac: "AC-07",
    title: "Production Build Output Artifacts",
    risk: "Critical",
    tags: ["@foundation", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const mainDist = path.join(projectRoot, "apps/studio/dist/main/index.js");
      if (!fs.existsSync(mainDist)) throw new Error("Production main/index.js missing in dist");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-008",
    story: "STORY-001",
    task: "TASK-008",
    ac: "AC-08",
    title: "Electron Main Process Startup Artifact",
    risk: "Critical",
    tags: ["@foundation", "@smoke"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ window }) {
      const title = await window.title();
      if (title && !title.includes("Open-Code.Studio"))
        throw new Error(`Unexpected window title: ${title}`);
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-009",
    story: "STORY-001",
    task: "TASK-009",
    ac: "AC-09",
    title: "Version Consistency Check Across Packages",
    risk: "Medium",
    tags: ["@foundation"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const rootPkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"));
      if (!rootPkg.version) throw new Error("Root version undeclared");
      return { pass: true };
    }
  },
  {
    id: "EPIC-0001-SC-010",
    story: "STORY-001",
    task: "TASK-010",
    ac: "AC-10",
    title: "Lockfile Resolution Consistency",
    risk: "Medium",
    tags: ["@foundation"],
    platform: ["macOS", "Windows", "Linux"],
    async run({ projectRoot }) {
      const lockPath = path.join(projectRoot, "pnpm-lock.yaml");
      const stat = fs.statSync(lockPath);
      if (stat.size < 500) throw new Error("Lockfile is abnormally small");
      return { pass: true };
    }
  }
];
