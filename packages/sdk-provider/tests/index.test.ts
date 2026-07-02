import { describe, expect, it } from "vitest";

import { SdkProviderPackage } from "../src/index.js";

describe("@ocs/sdk-provider", () => {
  it("exposes a public package identity", () => {
    expect(SdkProviderPackage.name).toBe("@ocs/sdk-provider");
  });
});
