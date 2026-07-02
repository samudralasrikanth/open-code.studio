import { describe, expect, it } from "vitest";

import { ConfigurationPackage } from "../src/index.js";

describe("@ocs/configuration", () => {
  it("exposes a public package identity", () => {
    expect(ConfigurationPackage.name).toBe("@ocs/configuration");
  });
});
