import { describe, expect, it, vi } from "vitest";

import { WorkspaceConfiguration } from "../src/application/WorkspaceConfiguration.js";
import { DEFAULT_WORKSPACE_CONFIGURATION } from "../src/domain/WorkspaceMetadata.js";
import type { IFileSystem } from "../src/infrastructure/IFileSystem.js";

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

describe("WorkspaceConfiguration", () => {
  it("returns defaults if config does not exist", async () => {
    const config = new WorkspaceConfiguration(makeFs(false));
    const result = await config.read("/project");
    expect(result.found).toBe(false);
    expect(result.config).toEqual(DEFAULT_WORKSPACE_CONFIGURATION);
  });

  it("returns defaults if JSON is invalid", async () => {
    const config = new WorkspaceConfiguration(makeFs(true, "invalid json"));
    const result = await config.read("/project");
    expect(result.found).toBe(true); // file exists but is invalid
    expect(result.config).toEqual(DEFAULT_WORKSPACE_CONFIGURATION);
  });

  it("coerces invalid fields to defaults", async () => {
    const json = JSON.stringify({
      name: 123, // should be string
      folders: "not an array", // should be array
      settings: [], // should be object but not array
      schemaVersion: "2" // should be number
    });
    const config = new WorkspaceConfiguration(makeFs(true, json));
    const result = await config.read("/project");
    expect(result.config).toEqual(DEFAULT_WORKSPACE_CONFIGURATION);
  });

  it("parses valid config", async () => {
    const json = JSON.stringify({
      name: "Custom Name",
      folders: ["a", "b"],
      settings: { key: "value" },
      schemaVersion: 2
    });
    const config = new WorkspaceConfiguration(makeFs(true, json));
    const result = await config.read("/project");
    expect(result.config).toEqual({
      name: "Custom Name",
      folders: ["a", "b"],
      settings: { key: "value" },
      schemaVersion: 2
    });
  });

  it("writes config", async () => {
    const fs = makeFs();
    const config = new WorkspaceConfiguration(fs);
    await config.write("/project", DEFAULT_WORKSPACE_CONFIGURATION);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(fs.mkdir).toHaveBeenCalledWith("/project/.ocs");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(fs.writeFile).toHaveBeenCalled();
  });
});
