import { describe, expect, it } from "vitest";

import { SdkAgentPackage } from "../src/index.js";

describe("@ocs/sdk-agent", () => {
  it("exposes a public package identity", () => {
    expect(SdkAgentPackage.name).toBe("@ocs/sdk-agent");
  });
});
