import { describe, expect, it } from "vitest";

import { PolicyPackage } from "../src/index.js";

describe("@ocs/policy", () => {
  it("exposes a public package identity", () => {
    expect(PolicyPackage.name).toBe("@ocs/policy");
  });
});
