import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

process.env.PATH = (process.env.PATH || "") + ":/opt/homebrew/bin";

import { RipgrepProvider } from "../src/providers/RipgrepProvider.js";
import type { SearchQuery } from "../src/domain/SearchQuery.js";

async function generateMockFiles(dir: string, count: number) {
  for (let i = 0; i < count; i++) {
    const filePath = path.join(dir, `file_${i}.ts`);
    const content = `// mock file ${i}
export const foo${i} = "bar";
export function searchTarget() {
  console.log("target_string_to_find");
}
`;
    await fs.writeFile(filePath, content, "utf8");
  }
}

async function runBenchmark(fileCount: number, dir: string) {
  console.log(`\n--- Benchmarking ${fileCount} files ---`);
  await generateMockFiles(dir, fileCount);
  const provider = new RipgrepProvider();

  const query: SearchQuery = {
    id: `bench-${fileCount}`,
    text: "target_string_to_find",
    isRegex: false,
    matchCase: false,
    matchWholeWord: false
  };

  const start = performance.now();
  let matchesCount = 0;

  try {
    await provider.search(
      query,
      dir,
      (result) => {
        matchesCount += result.matches.length;
      },
      () => {}
    );
  } catch (err: any) {
    console.error(`rg error:`, err);
  }

  const end = performance.now();
  console.log(
    `Matched ${matchesCount} times across ${fileCount} files in ${(end - start).toFixed(2)}ms`
  );
}

async function runGlobTest(dir: string) {
  console.log(`\n--- Glob Tests ---`);
  const provider = new RipgrepProvider();

  // Create a subfolder with node_modules and .git
  const nmDir = path.join(dir, "node_modules");
  const gitDir = path.join(dir, ".git");
  const srcDir = path.join(dir, "src");
  await fs.mkdir(nmDir, { recursive: true });
  await fs.mkdir(gitDir, { recursive: true });
  await fs.mkdir(srcDir, { recursive: true });

  await fs.writeFile(path.join(nmDir, "ignore_me.ts"), "target_string_to_find", "utf8");
  await fs.writeFile(path.join(gitDir, "ignore_me.ts"), "target_string_to_find", "utf8");
  await fs.writeFile(path.join(srcDir, "find_me.ts"), "target_string_to_find", "utf8");

  // Valid Globs
  let matchesCount = 0;
  await provider.search(
    { id: "glob1", text: "target_string_to_find" },
    dir,
    (res) => {
      matchesCount += res.matches.length;
    },
    () => {}
  );
  console.log(
    `Default excludes (should ignore node_modules/.git): found ${matchesCount} (Expected 1)`
  );

  matchesCount = 0;
  await provider.search(
    { id: "glob2", text: "target_string_to_find", includePatterns: ["**/*.ts"] },
    dir,
    (res) => {
      matchesCount += res.matches.length;
    },
    () => {}
  );
  console.log(`Include **/*.ts: found ${matchesCount} (Expected 1)`);

  // Invalid Glob Handling
  matchesCount = 0;
  let caughtError = false;
  try {
    await provider.search(
      { id: "glob3", text: "target_string_to_find", includePatterns: ["**/*.{ts"] },
      dir,
      (res) => {
        matchesCount += res.matches.length;
      },
      () => {}
    );
  } catch (err: any) {
    caughtError = true;
    console.log(`Invalid Glob caught correctly: ${err.message}`);
  }

  if (!caughtError) {
    console.log(`Invalid Glob did NOT throw, ripgrep gracefully handled it: found ${matchesCount}`);
  }
}

import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function main() {
  const baseTmpDir = path.join(process.cwd(), "tmp_bench");
  await fs.mkdir(baseTmpDir, { recursive: true });

  try {
    const globDir = path.join(baseTmpDir, "glob");
    await fs.mkdir(globDir, { recursive: true });
    await runGlobTest(globDir);

    const bench100Dir = path.join(baseTmpDir, "100");
    await fs.mkdir(bench100Dir, { recursive: true });
    await runBenchmark(100, bench100Dir);

    const bench1000Dir = path.join(baseTmpDir, "1000");
    await fs.mkdir(bench1000Dir, { recursive: true });
    await runBenchmark(1000, bench1000Dir);

    const bench10000Dir = path.join(baseTmpDir, "10000");
    await fs.mkdir(bench10000Dir, { recursive: true });
    await runBenchmark(10000, bench10000Dir);
  } finally {
    await fs.rm(baseTmpDir, { recursive: true, force: true });
  }
}

main().catch(console.error);
