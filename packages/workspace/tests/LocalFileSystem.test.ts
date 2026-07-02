import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { LocalFileSystem } from "../src/infrastructure/LocalFileSystem.js";

describe("LocalFileSystem", () => {
  it("implements stat, exists, readFile, writeFile, mkdir, join", async () => {
    const fs = new LocalFileSystem();
    const tmp = await mkdtemp(join(tmpdir(), "ocs-test-fs-"));
    try {
      const file = fs.join(tmp, "test.txt");

      expect(await fs.exists(file)).toBe(false);

      await fs.writeFile(file, "hello");
      expect(await fs.exists(file)).toBe(true);

      const content = await fs.readFile(file);
      expect(content).toBe("hello");

      const st = await fs.stat(file);
      expect(st.isFile).toBe(true);
      expect(st.isDirectory).toBe(false);
      expect(st.sizeBytes).toBe(5);

      const dir = fs.join(tmp, "subdir");
      await fs.mkdir(dir);
      const stDir = await fs.stat(dir);
      expect(stDir.isDirectory).toBe(true);

      // mkdir recursive
      await fs.mkdir(fs.join(dir, "nested"));
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
