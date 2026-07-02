import { describe, expect, it } from "vitest";

import { ToolingLintPackage } from "../src/index.js";

describe("@ocs/tooling-lint", () => {
  it("exposes a public package identity", () => {
    expect(ToolingLintPackage.name).toBe("@ocs/tooling-lint");
  });
});
