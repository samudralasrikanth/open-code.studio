import { describe, expect, it } from "vitest";

import { AppStudioPackage } from "../src/index.js";

describe("@ocs/app-studio", () => {
  it("exposes a public package identity", () => {
    expect(AppStudioPackage.name).toBe("@ocs/app-studio");
  });
});
