import { describe, expect, it } from "vitest";

import { ToolingGeneratorsPackage } from "../src/index.js";

describe("@ocs/tooling-generators", () => {
  it("exposes a public package identity", () => {
    expect(ToolingGeneratorsPackage.name).toBe("@ocs/tooling-generators");
  });
});
