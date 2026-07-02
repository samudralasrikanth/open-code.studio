import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const workspaces = ["apps", "packages", "services", "tooling"];
const failures = [];

for (const workspaceRoot of workspaces) {
  const absoluteRoot = join(root, workspaceRoot);
  let entries = [];
  try {
    entries = readdirSync(absoluteRoot);
  } catch {
    continue;
  }

  for (const entry of entries) {
    const packageRoot = join(absoluteRoot, entry);
    if (!statSync(packageRoot).isDirectory()) {
      continue;
    }

    for (const required of ["README.md", "docs/README.md", "CHANGELOG.md"]) {
      try {
        statSync(join(packageRoot, required));
      } catch {
        failures.push(`${relative(root, packageRoot)} is missing ${required}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Documentation validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Documentation validation passed.");
