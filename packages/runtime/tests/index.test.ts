import { describe, expect, it } from "vitest";

import { RuntimePackage } from "../src/index.js";

describe("@ocs/runtime", () => {
  it("exposes a public package identity", () => {
    expect(RuntimePackage.name).toBe("@ocs/runtime");
  });
});
