import { describe, expect, it } from "vitest";

import { MemoryPackage } from "../src/index.js";

describe("@ocs/memory", () => {
  it("exposes a public package identity", () => {
    expect(MemoryPackage.name).toBe("@ocs/memory");
  });
});
