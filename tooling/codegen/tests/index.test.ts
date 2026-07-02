import { describe, expect, it } from "vitest";

import { ToolingCodegenPackage } from "../src/index.js";

describe("@ocs/tooling-codegen", () => {
  it("exposes a public package identity", () => {
    expect(ToolingCodegenPackage.name).toBe("@ocs/tooling-codegen");
  });
});
