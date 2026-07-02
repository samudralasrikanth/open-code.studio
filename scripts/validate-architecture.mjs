import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const workspaceRoots = ["apps", "packages", "services", "tooling"];
const requiredPackageFiles = [
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "src/index.ts",
  "docs/README.md"
];
const sourceRoots = [
  "api",
  "application",
  "domain",
  "infrastructure",
  "adapters",
  "events",
  "errors",
  "types"
];

const forbiddenDependencyPrefixes = new Map([
  ["@ocs/runtime", ["@ocs/ui", "@ocs/workflow"]],
  ["@ocs/gateway", ["@ocs/app-studio", "@ocs/app-browser", "@ocs/app-enterprise-console"]],
  ["@ocs/knowledge", ["@ocs/runtime"]],
  [
    "@ocs/sdk-provider",
    [
      "@ocs/runtime",
      "@ocs/gateway",
      "@ocs/knowledge",
      "@ocs/memory",
      "@ocs/workflow",
      "@ocs/agents",
      "@ocs/policy"
    ]
  ],
  [
    "@ocs/sdk-agent",
    [
      "@ocs/runtime",
      "@ocs/gateway",
      "@ocs/knowledge",
      "@ocs/memory",
      "@ocs/workflow",
      "@ocs/agents",
      "@ocs/policy"
    ]
  ],
  [
    "@ocs/sdk-plugin",
    [
      "@ocs/runtime",
      "@ocs/gateway",
      "@ocs/knowledge",
      "@ocs/memory",
      "@ocs/workflow",
      "@ocs/agents",
      "@ocs/policy"
    ]
  ],
  [
    "@ocs/sdk-workflow",
    [
      "@ocs/runtime",
      "@ocs/gateway",
      "@ocs/knowledge",
      "@ocs/memory",
      "@ocs/workflow",
      "@ocs/agents",
      "@ocs/policy"
    ]
  ]
]);

const failures = [];

function existingWorkspaces() {
  return workspaceRoots.flatMap((workspaceRoot) => {
    const absoluteRoot = join(root, workspaceRoot);
    try {
      return readdirSync(absoluteRoot)
        .map((name) => join(absoluteRoot, name))
        .filter((entry) => statSync(entry).isDirectory());
    } catch {
      return [];
    }
  });
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

for (const workspace of existingWorkspaces()) {
  const location = relative(root, workspace);
  for (const file of requiredPackageFiles) {
    try {
      statSync(join(workspace, file));
    } catch {
      failures.push(`${location} is missing ${file}`);
    }
  }

  for (const sourceRoot of sourceRoots) {
    try {
      statSync(join(workspace, "src", sourceRoot));
    } catch {
      failures.push(`${location} is missing src/${sourceRoot}/`);
    }
  }

  const manifest = readJson(join(workspace, "package.json"));
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.peerDependencies,
    ...manifest.optionalDependencies
  };
  const forbidden = forbiddenDependencyPrefixes.get(manifest.name) ?? [];
  for (const dependency of Object.keys(dependencies)) {
    if (forbidden.some((prefix) => dependency === prefix || dependency.startsWith(`${prefix}/`))) {
      failures.push(`${manifest.name} must not depend on ${dependency}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Architecture validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Architecture validation passed.");
