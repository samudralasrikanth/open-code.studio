import { describe, expect, it } from "vitest";

import { AppEnterpriseConsolePackage } from "../src/index.js";

describe("@ocs/app-enterprise-console", () => {
  it("exposes a public package identity", () => {
    expect(AppEnterpriseConsolePackage.name).toBe("@ocs/app-enterprise-console");
  });
});
