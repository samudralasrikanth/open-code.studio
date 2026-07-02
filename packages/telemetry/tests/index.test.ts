import { describe, expect, it } from "vitest";

import { TelemetryPackage } from "../src/index.js";

describe("@ocs/telemetry", () => {
  it("exposes a public package identity", () => {
    expect(TelemetryPackage.name).toBe("@ocs/telemetry");
  });
});
