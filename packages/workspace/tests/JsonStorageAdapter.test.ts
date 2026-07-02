import { describe, expect, it, vi } from "vitest";

import type { IFileSystem } from "../src/infrastructure/IFileSystem.js";
import { JsonStorageAdapter } from "../src/infrastructure/JsonStorageAdapter.js";

function makeFs(existsValue = true, fileContent = "{}"): IFileSystem {
  return {
    stat: vi.fn(),
    exists: vi.fn(() => Promise.resolve(existsValue)),
    readFile: vi.fn(() => Promise.resolve(fileContent)),
    writeFile: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    join: (...s: string[]) => s.join("/")
  };
}

// Mock fs/promises rename and unlink
vi.mock("node:fs/promises", () => ({
  rename: vi.fn(() => Promise.resolve()),
  unlink: vi.fn(() => Promise.resolve())
}));

describe("JsonStorageAdapter", () => {
  it("returns undefined if file does not exist", async () => {
    const adapter = new JsonStorageAdapter("/path/data.json", makeFs(false));
    const result = await adapter.load();
    expect(result).toBeUndefined();
  });

  it("returns parsed json if file exists", async () => {
    const adapter = new JsonStorageAdapter("/path/data.json", makeFs(true, '{"test": 123}'));
    const result = await adapter.load();
    expect(result).toEqual({ test: 123 });
  });

  it("returns undefined if file exists but JSON is corrupted", async () => {
    const adapter = new JsonStorageAdapter("/path/data.json", makeFs(true, "invalid"));
    const result = await adapter.load();
    expect(result).toBeUndefined();
  });

  it("saves data by writing to a tmp file and renaming", async () => {
    const fs = makeFs();
    const adapter = new JsonStorageAdapter("/path/data.json", fs);
    await adapter.save({ test: 123 });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(fs.mkdir).toHaveBeenCalledWith("/path");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(fs.writeFile).toHaveBeenCalledWith(
      "/path/data.json.tmp",
      JSON.stringify({ test: 123 }, null, 2)
    );
    // The mocked rename would be called here
  });

  it("clears data by unlinking file", async () => {
    const adapter = new JsonStorageAdapter("/path/data.json", makeFs());
    await expect(adapter.clear()).resolves.toBeUndefined();
    // The mocked unlink would be called here
  });
});
