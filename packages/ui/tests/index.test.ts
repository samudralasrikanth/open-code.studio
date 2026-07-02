import { describe, expect, it } from "vitest";

import { UiPackage } from "../src/index.js";

describe("@ocs/ui", () => {
  it("exposes a public package identity", () => {
    expect(UiPackage.name).toBe("@ocs/ui");
  });
});
