import { describe, expect, it } from "vitest";

import { AppCliPackage } from "../src/index.js";

describe("@ocs/app-cli", () => {
  it("exposes a public package identity", () => {
    expect(AppCliPackage.name).toBe("@ocs/app-cli");
  });
});
