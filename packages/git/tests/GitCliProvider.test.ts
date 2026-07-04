import { describe, it, expect, vi, beforeEach } from "vitest";

import { GitCliProvider } from "../src/infrastructure/GitCliProvider.js";

// Mock child_process
vi.mock("node:child_process", () => ({
  execFile: vi.fn(
    (
      _cmd: any,
      _args: any,
      _opts: any,
      callback: (error: Error | null, result: { stdout: string; stderr: string }) => void
    ) => {
      callback(null, { stdout: "", stderr: "" });
    }
  )
}));

describe("GitCliProvider", () => {
  let provider: GitCliProvider;

  beforeEach(() => {
    provider = new GitCliProvider("/mock/repo");
    vi.clearAllMocks();
  });

  it("should be instantiated", () => {
    expect(provider).toBeInstanceOf(GitCliProvider);
  });

  // Basic instantiation test for now.
  // Full testing requires complex output mocking for `git status --porcelain=v2 --branch`
});
