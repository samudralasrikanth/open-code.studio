import fs from "fs";
import path from "path";
import os from "os";

export function createTempWorkspace(name = "test-workspace") {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `ocs-${name}-`));

  // Create standard repo files
  fs.writeFileSync(path.join(tmpDir, "README.md"), "# Test Workspace\nCreated for E2E testing.");
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name, version: "1.0.0" }, null, 2)
  );

  const srcDir = path.join(tmpDir, "src");
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(path.join(srcDir, "index.ts"), 'console.log("Hello Open-Code.Studio");\n');
  fs.writeFileSync(
    path.join(srcDir, "utils.ts"),
    "export const add = (a: number, b: number) => a + b;\n"
  );

  return {
    dirPath: tmpDir,
    cleanup() {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  };
}

export function createLargeWorkspace(fileCount = 100) {
  const { dirPath, cleanup } = createTempWorkspace("large-workspace");
  const largeDir = path.join(dirPath, "generated");
  fs.mkdirSync(largeDir, { recursive: true });

  for (let i = 0; i < fileCount; i++) {
    fs.writeFileSync(
      path.join(largeDir, `file_${i.toString().padStart(3, "0")}.ts`),
      `// Generated test file ${i}\nexport const val_${i} = ${i};\n`
    );
  }

  return { dirPath, cleanup };
}
