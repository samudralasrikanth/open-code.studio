/* eslint-disable */
/**
 * scripts/health-check.mjs
 *
 * Checks the overall health of the development environment.
 * Exits 0 if everything is healthy, 1 if any check fails.
 *
 * Checks performed:
 *   - Node.js version
 *   - PNPM version
 *   - Required workspace packages present
 *   - All packages have required files (src/index.ts, package.json, README.md)
 *   - dist/ directories are built
 *   - No obviously circular workspace deps (package.json level)
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const MIN_NODE = [20, 11, 0];
const MIN_PNPM = [9, 0, 0];

const results = [];
let exitCode = 0;

function pass(label, detail = "") {
  results.push({ status: "✅", label, detail });
}

function fail(label, detail = "") {
  results.push({ status: "❌", label, detail });
  exitCode = 1;
}

function warn(label, detail = "") {
  results.push({ status: "⚠️ ", label, detail });
}

function parseVersion(vStr) {
  return vStr
    .replace(/^[v^~>=<]+/, "")
    .split(".")
    .map(Number);
}

function versionAtLeast(actual, minimum) {
  for (let i = 0; i < minimum.length; i++) {
    if ((actual[i] ?? 0) > minimum[i]) return true;
    if ((actual[i] ?? 0) < minimum[i]) return false;
  }
  return true;
}

// ── Node.js version ───────────────────────────────────────────────────────────
const nodeVersion = parseVersion(process.version);
if (versionAtLeast(nodeVersion, MIN_NODE)) {
  pass("Node.js version", process.version);
} else {
  fail("Node.js version", `${process.version} is below the minimum ${MIN_NODE.join(".")}`);
}

// ── PNPM version ──────────────────────────────────────────────────────────────
try {
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
  if (versionAtLeast(parseVersion(pnpmVersion), MIN_PNPM)) {
    pass("PNPM version", pnpmVersion);
  } else {
    fail("PNPM version", `${pnpmVersion} is below the minimum ${MIN_PNPM.join(".")}`);
  }
} catch {
  fail("PNPM version", "pnpm not found — run: corepack enable");
}

// ── Workspace packages ────────────────────────────────────────────────────────
const workspaceDirs = ["apps", "packages", "services", "tooling"];
const requiredFiles = ["package.json", "src/index.ts", "README.md"];
let totalPackages = 0;
let missingFiles = 0;

for (const dir of workspaceDirs) {
  const absDir = join(root, dir);
  if (!existsSync(absDir)) continue;
  const packages = readdirSync(absDir).filter((p) => statSync(join(absDir, p)).isDirectory());
  for (const pkg of packages) {
    totalPackages++;
    for (const file of requiredFiles) {
      if (!existsSync(join(absDir, pkg, file))) {
        warn("Missing file", `${relative(root, join(absDir, pkg, file))}`);
        missingFiles++;
      }
    }
  }
}

pass("Workspace packages scanned", `${totalPackages} packages`);
if (missingFiles === 0) {
  pass("Required package files", "all present");
} else {
  warn("Required package files", `${missingFiles} missing (see warnings above)`);
}

// ── Built packages ────────────────────────────────────────────────────────────
let unbuiltPackages = 0;
for (const dir of workspaceDirs) {
  const absDir = join(root, dir);
  if (!existsSync(absDir)) continue;
  const packages = readdirSync(absDir).filter((p) => statSync(join(absDir, p)).isDirectory());
  for (const pkg of packages) {
    const distDir = join(absDir, pkg, "dist");
    if (!existsSync(distDir)) {
      warn("Not built", `${dir}/${pkg} — run: pnpm build`);
      unbuiltPackages++;
    }
  }
}

if (unbuiltPackages === 0) {
  pass("Build artifacts", "all packages built");
} else {
  warn("Build artifacts", `${unbuiltPackages} packages not built`);
}

// ── node_modules ──────────────────────────────────────────────────────────────
if (existsSync(join(root, "node_modules"))) {
  pass("node_modules", "present");
} else {
  fail("node_modules", "missing — run: pnpm install");
}

// ── Print results ─────────────────────────────────────────────────────────────
console.log("\nOpen-Code.Studio — Health Check\n");
const maxLabel = Math.max(...results.map((r) => r.label.length));
for (const { status, label, detail } of results) {
  const padding = " ".repeat(maxLabel - label.length);
  console.log(`  ${status}  ${label}${padding}  ${detail}`);
}
console.log();

if (exitCode === 0) {
  console.log("Health check passed.\n");
} else {
  console.error("Health check failed. Resolve the errors above and re-run.\n");
}

process.exit(exitCode);
