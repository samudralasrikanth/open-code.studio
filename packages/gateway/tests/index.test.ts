import { describe, expect, it } from "vitest";

import { GatewayPackage } from "../src/index.js";

describe("@ocs/gateway", () => {
  it("exposes a public package identity", () => {
    expect(GatewayPackage.name).toBe("@ocs/gateway");
  });
});
