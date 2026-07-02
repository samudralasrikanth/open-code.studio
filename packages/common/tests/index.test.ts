import { describe, expect, it } from "vitest";

import { CommonPackage } from "../src/index.js";

describe("@ocs/common", () => {
  it("exposes a public package identity", () => {
    expect(CommonPackage.name).toBe("@ocs/common");
  });
});
