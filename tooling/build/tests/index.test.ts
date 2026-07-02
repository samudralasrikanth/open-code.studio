import { describe, expect, it } from "vitest";

import { ToolingBuildPackage } from "../src/index.js";

describe("@ocs/tooling-build", () => {
  it("exposes a public package identity", () => {
    expect(ToolingBuildPackage.name).toBe("@ocs/tooling-build");
  });
});
