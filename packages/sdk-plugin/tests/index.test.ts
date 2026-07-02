import { describe, expect, it } from "vitest";

import { SdkPluginPackage } from "../src/index.js";

describe("@ocs/sdk-plugin", () => {
  it("exposes a public package identity", () => {
    expect(SdkPluginPackage.name).toBe("@ocs/sdk-plugin");
  });
});
